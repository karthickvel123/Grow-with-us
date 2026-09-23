import ast
import json
import os
import sys
import tempfile
import time
import subprocess
from typing import List, Dict, Any, Tuple, Optional
from backend.app.core.config import settings

FORBIDDEN_MODULES = {
    "socket", "subprocess", "pty", "commands",
    "winreg", "_winapi", "ctypes"
}

FORBIDDEN_FUNCTIONS = {
    "eval", "exec", "__import__", "compile"
}

class SandboxSecurityError(Exception):
    pass

def validate_code_ast(code: str) -> None:
    """Check code for forbidden modules or dangerous calls before execution."""
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        # Syntax errors are allowed to be caught by the runner so the student gets normal compiler feedback
        return

    for node in ast.walk(tree):
        # Check forbidden imports
        if isinstance(node, ast.Import):
            for alias in node.names:
                mod_name = alias.name.split('.')[0]
                if mod_name in FORBIDDEN_MODULES:
                    raise SandboxSecurityError(f"Security restriction: Import of '{mod_name}' is not allowed in student sandbox.")
        elif isinstance(node, ast.ImportFrom):
            mod_name = (node.module or '').split('.')[0]
            if mod_name in FORBIDDEN_MODULES:
                raise SandboxSecurityError(f"Security restriction: Import from '{mod_name}' is not allowed in student sandbox.")
        # Check dangerous calls
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in {"system", "popen", "spawn"}:
                    raise SandboxSecurityError(f"Security restriction: Execution of '{node.func.id}' is forbidden.")

def run_isolated_process(script_content: str, timeout_seconds: int = 5) -> Tuple[str, str, float, int]:
    """Execute Python code in an isolated subprocess with strict timeout."""
    start_time = time.perf_counter()
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as tmp_file:
        tmp_file.write(script_content)
        tmp_file_path = tmp_file.name

    try:
        # Run using current python executable with restricted flags (-S for site-packages minimal, -E ignore python env vars)
        process = subprocess.run(
            [sys.executable, "-E", tmp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            cwd=tempfile.gettempdir()
        )
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return process.stdout, process.stderr, elapsed_ms, process.returncode
    except subprocess.TimeoutExpired:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return "", "ExecutionTimeoutError: Code exceeded maximum allowed time limit (5.0 seconds). Check for infinite loops (e.g. while True without break) or excessive recursion.", elapsed_ms, -1
    except Exception as e:
        elapsed_ms = (time.perf_counter() - start_time) * 1000
        return "", str(e), elapsed_ms, -1
    finally:
        if os.path.exists(tmp_file_path):
            try:
                os.remove(tmp_file_path)
            except Exception:
                pass

def execute_student_code(code: str, test_cases: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Executes student code and verifies test cases.
    Returns: status, stdout, stderr, execution_time_ms, test_results
    """
    try:
        validate_code_ast(code)
    except SandboxSecurityError as sec_err:
        return {
            "status": "error",
            "stdout": "",
            "stderr": str(sec_err),
            "execution_time_ms": 0.0,
            "all_passed": False,
            "passed_count": 0,
            "total_count": 0,
            "test_results": [],
            "error_type": "SecurityViolation",
            "error_message": str(sec_err)
        }

    # If no test cases are provided, execute the script directly as scratchpad
    if not test_cases:
        stdout, stderr, elapsed_ms, return_code = run_isolated_process(code, settings.SANDBOX_TIMEOUT_SECONDS)
        error_type = None
        error_msg = None
        status = "passed" if return_code == 0 else "error"
        
        if return_code != 0:
            if "ExecutionTimeoutError" in stderr:
                status = "timeout"
                error_type = "TimeoutError"
                error_msg = stderr
            else:
                status = "error"
                # Extract last line of stderr as error message
                err_lines = [line.strip() for line in stderr.splitlines() if line.strip()]
                if err_lines:
                    error_msg = err_lines[-1]
                    if ":" in error_msg:
                        error_type = error_msg.split(":")[0].strip()

        return {
            "status": status,
            "stdout": stdout,
            "stderr": stderr,
            "execution_time_ms": round(elapsed_ms, 2),
            "all_passed": (status == "passed"),
            "passed_count": 1 if status == "passed" else 0,
            "total_count": 1,
            "test_results": [],
            "error_type": error_type,
            "error_message": error_msg
        }

    # If test cases are provided, build a test harness
    # Supports both function calls like "solution(2, 3)" and stdout matching
    harness_code = [
        code,
        "\n# --- CodePath Automated Test Harness ---",
        "import json, sys\n",
        "__results = []\n"
    ]

    for idx, tc in enumerate(test_cases):
        test_input = tc.get("input", "").strip()
        expected = str(tc.get("expected", "")).strip()
        is_hidden = tc.get("hidden", False)

        if test_input:
            # Function-based test case
            harness_code.append(f"""
try:
    __out = {test_input}
    __actual = repr(__out) if not isinstance(__out, str) else __out
    __passed = (str(__actual).strip() == {repr(expected)}.strip()) or (repr(__out).strip() == {repr(expected)}.strip())
    __results.append({{"test_index": {idx + 1}, "input": {repr(test_input)}, "expected": {repr(expected)}, "actual": str(__actual), "passed": bool(__passed), "is_hidden": {is_hidden}}})
except Exception as __e:
    __results.append({{"test_index": {idx + 1}, "input": {repr(test_input)}, "expected": {repr(expected)}, "actual": f"Error: {{type(__e).__name__}}: {{__e}}", "passed": False, "is_hidden": {is_hidden}}})
""")
        else:
            # Stdout-based test case
            pass

    harness_code.append("""
print("__CODEPATH_TEST_JSON__" + json.dumps(__results))
""")

    combined_script = "\n".join(harness_code)
    stdout, stderr, elapsed_ms, return_code = run_isolated_process(combined_script, settings.SANDBOX_TIMEOUT_SECONDS)

    test_results = []
    clean_stdout = ""
    status = "passed"
    error_type = None
    error_msg = None

    if "__CODEPATH_TEST_JSON__" in stdout:
        parts = stdout.split("__CODEPATH_TEST_JSON__")
        clean_stdout = parts[0].strip()
        try:
            test_results = json.loads(parts[1].strip())
        except Exception:
            test_results = []
    else:
        clean_stdout = stdout.strip()

    # Check any stdout-based test cases (where input is empty)
    for idx, tc in enumerate(test_cases):
        test_input = tc.get("input", "").strip()
        if not test_input:
            expected = str(tc.get("expected", "")).strip()
            is_hidden = tc.get("hidden", False)
            passed = (expected in clean_stdout) or (expected == clean_stdout)
            test_results.append({
                "test_index": idx + 1,
                "input": "(stdout print)",
                "expected": expected,
                "actual": clean_stdout if clean_stdout else "(no output)",
                "passed": passed,
                "is_hidden": is_hidden
            })

    if return_code != 0:
        if "ExecutionTimeoutError" in stderr:
            status = "timeout"
            error_type = "TimeoutError"
            error_msg = stderr
        else:
            status = "error"
            err_lines = [line.strip() for line in stderr.splitlines() if line.strip()]
            if err_lines:
                error_msg = err_lines[-1]
                if ":" in error_msg:
                    error_type = error_msg.split(":")[0].strip()
        passed_count = 0
        all_passed = False
    else:
        passed_count = sum(1 for r in test_results if r.get("passed", False))
        total_count = len(test_results)
        all_passed = (passed_count == total_count and total_count > 0)
        status = "passed" if all_passed else "failed"

    return {
        "status": status,
        "stdout": clean_stdout,
        "stderr": stderr,
        "execution_time_ms": round(elapsed_ms, 2),
        "all_passed": all_passed,
        "passed_count": passed_count,
        "total_count": len(test_results) if test_cases else 1,
        "test_results": test_results,
        "error_type": error_type,
        "error_message": error_msg
    }
