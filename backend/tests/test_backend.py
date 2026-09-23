import pytest
from backend.app.services.sandbox import execute_student_code
from backend.app.services.ai_teacher import AITeacherService
from backend.app.services.mastery import compute_mastery_status

def test_sandbox_simple_execution():
    code = "x = 10\ny = 20\nprint(x + y)"
    res = execute_student_code(code)
    assert res["status"] == "passed"
    assert "30" in res["stdout"]
    assert res["error_message"] is None

def test_sandbox_function_test_cases():
    code = """
def add(a, b):
    return a + b
"""
    test_cases = [
        {"input": "add(2, 3)", "expected": "5", "hidden": False},
        {"input": "add(-1, 1)", "expected": "0", "hidden": False},
        {"input": "add(10, 20)", "expected": "30", "hidden": False}
    ]
    res = execute_student_code(code, test_cases)
    assert res["status"] == "passed"
    assert res["all_passed"] is True
    assert res["passed_count"] == 3

def test_sandbox_infinite_loop_timeout():
    code = """
while True:
    pass
"""
    res = execute_student_code(code)
    assert res["status"] == "timeout"
    assert "ExecutionTimeoutError" in res["stderr"]

def test_sandbox_security_restriction():
    code = """
import subprocess
subprocess.run(['dir'])
"""
    res = execute_student_code(code)
    assert res["status"] == "error"
    assert "Security restriction" in res["stderr"]

def test_mastery_status_tiers():
    assert compute_mastery_status(95.0) == "Strong"
    assert compute_mastery_status(72.0) == "Good"
    assert compute_mastery_status(50.0) == "Needs Practice"
    assert compute_mastery_status(25.0) == "Weak"
    assert compute_mastery_status(0.0) == "Not Learned"

def test_ai_teacher_heuristic_evaluation():
    # Test missing return in function
    code = "def solution(a, b):\n    print(a + b)"
    eval_res = AITeacherService.evaluate_code(code, "functions", "Write a function returning a + b")
    assert eval_res["is_correct"] is False
    assert "return" in eval_res["detected_misconception"].lower() or "functions" in eval_res["detected_misconception"].lower()

def test_ai_teacher_hint_tiers():
    h1 = AITeacherService.get_hint(1, "variables", "x = 5")
    assert h1["tier"] == 1
    assert "Conceptual Hint" in h1["tier_name"]

    h5 = AITeacherService.get_hint(5, "variables", "x = 5")
    assert h5["tier"] == 5
    assert h5["revealed_solution"] is True
