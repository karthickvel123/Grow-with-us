import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.entities import CourseStage, Module, Lesson, Concept, Problem

CURRICULUM_DATA = [
    {
        "stage_number": 0,
        "title": "Stage 0 — Programming Foundations",
        "description": "Zero to confident Python beginner: what is coding, variables, data types, and expressions.",
        "badge_name": "Foundations Apprentice",
        "modules": [
            {
                "title": "Module 1: What is Programming & Python",
                "description": "Your first steps in thinking like a computer and running Python.",
                "lessons": [
                    {
                        "title": "What is Python, print() and Comments",
                        "concept_key": "print_and_comments",
                        "concept_explanation": "Programming is writing a clear set of step-by-step instructions that a computer can execute faithfully. Python is one of the world's most popular, human-readable programming languages. The `print()` function tells Python to display text or numbers on your screen, while comments (marked with `#`) are private notes for humans that Python ignores completely.",
                        "real_world_analogy": "Imagine giving a recipe to a robotic chef. If you tell it 'print(\"Hello!\")', the chef displays that message on the kitchen counter display. A comment is like a sticky note on the counter saying '# Remember to buy eggs' — the chef doesn't read it out loud.",
                        "code_example": "# This is a comment\nprint(\"Welcome to CodePath AI!\")\nprint(42)",
                        "interactive_question": "What will Python do when it sees a line that starts with '# Reminder'?",
                        "interactive_options_json": json.dumps([
                            "It prints 'Reminder' to the console",
                            "It ignores the line completely as a human note",
                            "It raises a SyntaxError",
                            "It creates a variable named Reminder"
                        ]),
                        "interactive_answer": "It ignores the line completely as a human note",
                        "coding_challenge": "Write a Python script that prints the exact message: 'Hello, CodePath!' on the first line, and your favorite number (any integer) on the second line.",
                        "starter_code": "# Write your code below:\n",
                        "solution_code": "print(\"Hello, CodePath!\")\nprint(7)",
                        "test_cases_json": json.dumps([
                            {"input": "", "expected": "Hello, CodePath!", "hidden": False}
                        ]),
                        "hint_1": "Use the print() function with parentheses.",
                        "hint_2": "Strings must be wrapped in quotes like \"Hello, CodePath!\".",
                        "hint_3": "Call print() twice: once for the text greeting, once for your number.",
                        "hint_4": "print(\"Hello, CodePath!\")\nprint(10)",
                        "mastery_check_prompt": "Print the word 'Python' followed by the number 2026 on a second line.",
                        "mastery_check_starter": "# Mastery check:\n",
                        "mastery_check_solution": "print(\"Python\")\nprint(2026)",
                        "mastery_check_tests_json": json.dumps([{"input": "", "expected": "Python", "hidden": False}])
                    },
                    {
                        "title": "Variables & Labeled Storage Boxes",
                        "concept_key": "variables",
                        "concept_explanation": "A variable is a named storage container in computer memory that holds data so you can use and update it later. In Python, creating a variable is as simple as writing `name = value`. Python automatically determines the data type (text string, whole integer, decimal float, or boolean true/false).",
                        "real_world_analogy": "Think of a variable as a labeled storage box in your closet. If you write 'shoes' on the box and place 3 pairs inside (`shoes = 3`), you can later open the box to see how many shoes you have, or put 1 more in (`shoes = shoes + 1`).",
                        "code_example": "player_name = \"Alex\"\nscore = 150\nis_game_over = False\nprint(player_name, \"has score:\", score)",
                        "interactive_question": "If you write `x = 10` followed by `x = 25`, what is stored inside `x`?",
                        "interactive_options_json": json.dumps([
                            "Both 10 and 25 are stored together",
                            "10, because the first value cannot be changed",
                            "25, because the old value 10 was replaced",
                            "An error occurs"
                        ]),
                        "interactive_answer": "25, because the old value 10 was replaced",
                        "coding_challenge": "Create a variable called `city` with value 'San Francisco', and a variable called `temperature` with value 68. Then print them separated by a comma.",
                        "starter_code": "# Define your variables below:\n",
                        "solution_code": "city = \"San Francisco\"\ntemperature = 68\nprint(city, temperature)",
                        "test_cases_json": json.dumps([
                            {"input": "", "expected": "San Francisco 68", "hidden": False}
                        ]),
                        "hint_1": "Assign values using the single equals sign (=).",
                        "hint_2": "city gets a string in quotes; temperature gets an integer without quotes.",
                        "hint_3": "Pass both variable names into print() separated by a comma.",
                        "hint_4": "city = \"San Francisco\"\ntemperature = 68\nprint(city, temperature)",
                        "mastery_check_prompt": "Define a variable `age = 25` and print `age + 5`.",
                        "mastery_check_starter": "# Mastery check:\n",
                        "mastery_check_solution": "age = 25\nprint(age + 5)",
                        "mastery_check_tests_json": json.dumps([{"input": "", "expected": "30", "hidden": False}])
                    },
                    {
                        "title": "Data Types & Type Conversion",
                        "concept_key": "data_types",
                        "concept_explanation": "Every piece of data in Python has a type. The four main primitive types are `str` (text), `int` (whole numbers), `float` (decimals), and `bool` (True or False). When receiving user input, Python gives you a `str`. To do math with it, you must convert it using `int()` or `float()`.",
                        "real_world_analogy": "Imagine a bank coin-sorting machine. If you drop in paper Monopoly money (a string of digits '100'), it cannot be credited to your real account until it is officially stamped into legal currency coins (`int('100')`).",
                        "code_example": "price_str = \"19\"\ntax_rate = 0.08\nprice_num = int(price_str)\ntotal = price_num + (price_num * tax_rate)\nprint(\"Total:\", total)",
                        "interactive_question": "What is the result of `\"5\" + \"5\"` in Python?",
                        "interactive_options_json": json.dumps([
                            "10",
                            "\"55\"",
                            "TypeError",
                            "None"
                        ]),
                        "interactive_answer": "\"55\"",
                        "coding_challenge": "Given a string variable `raw_points = \"50\"`, convert it to an integer, add 25 to it, and print the resulting number.",
                        "starter_code": "raw_points = \"50\"\n# Convert raw_points to integer and add 25:\n",
                        "solution_code": "raw_points = \"50\"\npoints = int(raw_points)\nprint(points + 25)",
                        "test_cases_json": json.dumps([
                            {"input": "", "expected": "75", "hidden": False}
                        ]),
                        "hint_1": "Use the int() conversion function.",
                        "hint_2": "Assign the result of int(raw_points) to a new variable.",
                        "hint_3": "Add 25 to your converted number.",
                        "hint_4": "points = int(raw_points)\nprint(points + 25)",
                        "mastery_check_prompt": "Convert '100' to float and print it divided by 4.",
                        "mastery_check_starter": "val = '100'\n",
                        "mastery_check_solution": "val = '100'\nprint(float(val) / 4)",
                        "mastery_check_tests_json": json.dumps([{"input": "", "expected": "25.0", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 1,
        "title": "Stage 1 — Python Fundamentals",
        "description": "Conditionals, loops, lists, dictionaries, and functions with clean scope.",
        "badge_name": "Fundamentals Architect",
        "modules": [
            {
                "title": "Module 2: Decisions & Loops",
                "description": "Control the flow of program execution using branching and iteration.",
                "lessons": [
                    {
                        "title": "If, Elif, Else: Branching Decisions",
                        "concept_key": "conditionals",
                        "concept_explanation": "Programs need to make decisions based on changing conditions. The `if` statement evaluates a boolean expression. If it is True, its indented block runs. If False, Python checks any `elif` (else-if) branches, and falls back to `else` if none matched.",
                        "real_world_analogy": "A traffic signal: IF the light is red, STOP. ELIF the light is yellow, SLOW DOWN. ELSE (it must be green), GO.",
                        "code_example": "speed = 72\nif speed > 70:\n    print(\"Speeding ticket!\")\nelif speed >= 50:\n    print(\"Cruising speed.\")\nelse:\n    print(\"Driving too slow.\")",
                        "interactive_question": "Which comparison operator checks if two values are equal?",
                        "interactive_options_json": json.dumps([
                            "=",
                            "==",
                            "===",
                            "!="
                        ]),
                        "interactive_answer": "==",
                        "coding_challenge": "Write a function `check_pass(score)` that returns 'Pass' if score is 60 or higher, and 'Fail' otherwise.",
                        "starter_code": "def check_pass(score):\n    # Write your if/else logic here:\n    pass\n",
                        "solution_code": "def check_pass(score):\n    if score >= 60:\n        return \"Pass\"\n    else:\n        return \"Fail\"",
                        "test_cases_json": json.dumps([
                            {"input": "check_pass(85)", "expected": "Pass", "hidden": False},
                            {"input": "check_pass(60)", "expected": "Pass", "hidden": False},
                            {"input": "check_pass(42)", "expected": "Fail", "hidden": False}
                        ]),
                        "hint_1": "Compare score with 60 using >=.",
                        "hint_2": "Remember to use 'return' instead of print().",
                        "hint_3": "if score >= 60:\n    return \"Pass\"\nelse:\n    return \"Fail\"",
                        "hint_4": "def check_pass(score):\n    if score >= 60:\n        return \"Pass\"\n    return \"Fail\"",
                        "mastery_check_prompt": "Write a function `is_even(n)` returning True if n is divisible by 2 (% 2 == 0) and False otherwise.",
                        "mastery_check_starter": "def is_even(n):\n    pass\n",
                        "mastery_check_solution": "def is_even(n):\n    return n % 2 == 0",
                        "mastery_check_tests_json": json.dumps([
                            {"input": "is_even(4)", "expected": "True", "hidden": False},
                            {"input": "is_even(7)", "expected": "False", "hidden": False}
                        ])
                    },
                    {
                        "title": "Loops: For, While, Range",
                        "concept_key": "loops",
                        "concept_explanation": "Loops automate repetitive tasks. A `for` loop iterates over a sequence (like numbers in a `range()` or items in a list). A `while` loop continues running as long as its condition remains True. You can stop early with `break` or skip to the next cycle with `continue`.",
                        "real_world_analogy": "An automatic passport scanner at an airport checkpoint: FOR each passenger in the queue of 50 people, scan their passport. If someone's visa is flagged, BREAK and halt the line.",
                        "code_example": "total = 0\nfor i in range(1, 5):\n    total += i\nprint(\"Sum:\", total)  # 1 + 2 + 3 + 4 = 10",
                        "interactive_question": "What sequence does `range(2, 6)` generate?",
                        "interactive_options_json": json.dumps([
                            "[2, 3, 4, 5, 6]",
                            "[2, 3, 4, 5]",
                            "[3, 4, 5, 6]",
                            "[2, 4, 6]"
                        ]),
                        "interactive_answer": "[2, 3, 4, 5]",
                        "coding_challenge": "Write a function `sum_numbers(n)` that calculates and returns the sum of all integers from 1 up to n (inclusive).",
                        "starter_code": "def sum_numbers(n):\n    # Calculate sum 1 to n:\n    pass\n",
                        "solution_code": "def sum_numbers(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total",
                        "test_cases_json": json.dumps([
                            {"input": "sum_numbers(5)", "expected": "15", "hidden": False},
                            {"input": "sum_numbers(1)", "expected": "1", "hidden": False},
                            {"input": "sum_numbers(10)", "expected": "55", "hidden": False}
                        ]),
                        "hint_1": "Initialize an accumulator variable `total = 0`.",
                        "hint_2": "Remember range() stop is exclusive! Use range(1, n + 1).",
                        "hint_3": "Add each number to total inside the loop.",
                        "hint_4": "total = 0\nfor i in range(1, n + 1):\n    total += i\nreturn total",
                        "mastery_check_prompt": "Write a function `count_down(n)` that returns a list of numbers from n down to 1.",
                        "mastery_check_starter": "def count_down(n):\n    pass\n",
                        "mastery_check_solution": "def count_down(n):\n    return list(range(n, 0, -1))",
                        "mastery_check_tests_json": json.dumps([{"input": "count_down(3)", "expected": "[3, 2, 1]", "hidden": False}])
                    },
                    {
                        "title": "Dictionaries & Key-Value Lookup",
                        "concept_key": "dictionaries",
                        "concept_explanation": "A dictionary is Python's implementation of a hash map. Instead of integer indices (0, 1, 2), dictionaries store pairs of `key: value`. Keys are unique and allow near-instant average O(1) lookups.",
                        "real_world_analogy": "A physical phonebook or contact list on your smartphone. You don't ask for 'contact #47'; you look up the name 'Mom' (key) to get her phone number (value).",
                        "code_example": "student = {\"name\": \"Sophia\", \"gpa\": 3.9, \"major\": \"CS\"}\nprint(student[\"name\"])\nstudent[\"gpa\"] = 4.0\nprint(student.get(\"minor\", \"None\"))",
                        "interactive_question": "What happens if you run `d = {'a': 1}; print(d['b'])`?",
                        "interactive_options_json": json.dumps([
                            "It returns None",
                            "It raises a KeyError",
                            "It prints 0",
                            "It creates the key 'b'"
                        ]),
                        "interactive_answer": "It raises a KeyError",
                        "coding_challenge": "Write a function `word_frequencies(words)` that takes a list of words and returns a dictionary counting how many times each word appears.",
                        "starter_code": "def word_frequencies(words):\n    # Return dict with word counts:\n    pass\n",
                        "solution_code": "def word_frequencies(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts",
                        "test_cases_json": json.dumps([
                            {"input": "word_frequencies(['apple', 'banana', 'apple'])", "expected": "{'apple': 2, 'banana': 1}", "hidden": False},
                            {"input": "word_frequencies(['cat'])", "expected": "{'cat': 1}", "hidden": False}
                        ]),
                        "hint_1": "Create an empty dictionary `counts = {}`.",
                        "hint_2": "Iterate through each word with a for loop.",
                        "hint_3": "Use `counts[w] = counts.get(w, 0) + 1` to safely handle new and existing keys.",
                        "hint_4": "def word_frequencies(words):\n    counts = {}\n    for w in words:\n        counts[w] = counts.get(w, 0) + 1\n    return counts",
                        "mastery_check_prompt": "Write a function `get_capital(country_dict, country)` that returns the capital or 'Unknown'.",
                        "mastery_check_starter": "def get_capital(country_dict, country):\n    pass\n",
                        "mastery_check_solution": "def get_capital(country_dict, country):\n    return country_dict.get(country, \"Unknown\")",
                        "mastery_check_tests_json": json.dumps([{"input": "get_capital({'France': 'Paris'}, 'France')", "expected": "Paris", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 2,
        "title": "Stage 2 — Intermediate Python",
        "description": "Comprehensions, lambda, exceptions, file handling, and Object-Oriented Programming (OOP).",
        "badge_name": "Python Craftsman",
        "modules": [
            {
                "title": "Module 3: Advanced Idioms & OOP",
                "description": "Write elegant, pythonic, object-oriented code.",
                "lessons": [
                    {
                        "title": "List Comprehensions & Lambdas",
                        "concept_key": "list_comprehensions",
                        "concept_explanation": "List comprehensions offer a concise way to create lists from existing iterables: `[expression for item in iterable if condition]`. They replace multi-line loop appends with one clean line.",
                        "real_world_analogy": "An espresso machine with a single button that grinds, brews, and pours in one fluid process, rather than manually carrying cups between 4 different stations.",
                        "code_example": "numbers = [1, 2, 3, 4, 5, 6]\nevens_squared = [x**2 for x in numbers if x % 2 == 0]\nprint(evens_squared)  # [4, 16, 36]",
                        "interactive_question": "What is `[x * 2 for x in [1, 2, 3]]`?",
                        "interactive_options_json": json.dumps([
                            "[1, 2, 3, 1, 2, 3]",
                            "[2, 4, 6]",
                            "[2, 2, 2]",
                            "SyntaxError"
                        ]),
                        "interactive_answer": "[2, 4, 6]",
                        "coding_challenge": "Write a function `filter_positives(nums)` that uses a list comprehension to return only the positive numbers (> 0) from the input list.",
                        "starter_code": "def filter_positives(nums):\n    # Use list comprehension:\n    pass\n",
                        "solution_code": "def filter_positives(nums):\n    return [x for x in nums if x > 0]",
                        "test_cases_json": json.dumps([
                            {"input": "filter_positives([-2, 5, 0, 8, -1])", "expected": "[5, 8]", "hidden": False},
                            {"input": "filter_positives([-5, -1])", "expected": "[]", "hidden": False}
                        ]),
                        "hint_1": "Format: [x for x in nums if condition].",
                        "hint_2": "The condition is x > 0.",
                        "hint_3": "return [x for x in nums if x > 0]",
                        "hint_4": "def filter_positives(nums):\n    return [x for x in nums if x > 0]",
                        "mastery_check_prompt": "Return squares of all numbers: [x**2 for x in nums].",
                        "mastery_check_starter": "def squares(nums):\n    pass\n",
                        "mastery_check_solution": "def squares(nums):\n    return [x**2 for x in nums]",
                        "mastery_check_tests_json": json.dumps([{"input": "squares([2, 3])", "expected": "[4, 9]", "hidden": False}])
                    },
                    {
                        "title": "OOP: Classes, Objects, and Inheritance",
                        "concept_key": "oop",
                        "concept_explanation": "Object-Oriented Programming (OOP) bundles related data (attributes) and behaviors (methods) together into blueprints called Classes. Objects are actual instances built from those blueprints.",
                        "real_world_analogy": "An architectural blueprint for a house is the Class. The actual physical house constructed on Elm Street with painted walls and lights is the Object.",
                        "code_example": "class BankAccount:\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance",
                        "interactive_question": "What is the purpose of the `__init__` method in Python?",
                        "interactive_options_json": json.dumps([
                            "To destroy an object when done",
                            "To initialize attributes when a new instance is created",
                            "To print the object's memory address",
                            "To prevent other classes from inheriting"
                        ]),
                        "interactive_answer": "To initialize attributes when a new instance is created",
                        "coding_challenge": "Create a class `Rectangle` with `__init__(self, width, height)` and a method `area(self)` that returns `width * height`.",
                        "starter_code": "class Rectangle:\n    # Define __init__ and area method:\n    pass\n",
                        "solution_code": "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height",
                        "test_cases_json": json.dumps([
                            {"input": "Rectangle(4, 5).area()", "expected": "20", "hidden": False},
                            {"input": "Rectangle(10, 10).area()", "expected": "100", "hidden": False}
                        ]),
                        "hint_1": "Store self.width = width and self.height = height in __init__.",
                        "hint_2": "Define area(self) and return self.width * self.height.",
                        "hint_3": "class Rectangle:\n    def __init__(self, width, height):\n        self.width = width\n        self.height = height\n    def area(self):\n        return self.width * self.height",
                        "hint_4": "# See hint 3",
                        "mastery_check_prompt": "Add perimeter(self) returning 2 * (self.width + self.height).",
                        "mastery_check_starter": "class Box:\n    def __init__(self, w, h):\n        self.w, self.h = w, h\n    def perimeter(self):\n        pass\n",
                        "mastery_check_solution": "class Box:\n    def __init__(self, w, h):\n        self.w, self.h = w, h\n    def perimeter(self):\n        return 2 * (self.w + self.h)",
                        "mastery_check_tests_json": json.dumps([{"input": "Box(3, 4).perimeter()", "expected": "14", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 3,
        "title": "Stage 3 — Problem Solving & Complexity",
        "description": "Big-O notation, time and space complexity, dry running, and pattern recognition.",
        "badge_name": "Complexity Analyst",
        "modules": [
            {
                "title": "Module 4: Big-O & Complexity",
                "description": "Analyze algorithmic efficiency like a senior engineer.",
                "lessons": [
                    {
                        "title": "Big-O Time & Space Complexity",
                        "concept_key": "big_o",
                        "concept_explanation": "Big-O notation describes how an algorithm's runtime or memory consumption scales as the input size N grows toward infinity. Common complexities: O(1) constant, O(log N) logarithmic, O(N) linear, O(N log N) linearithmic, and O(N^2) quadratic.",
                        "real_world_analogy": "Sending a message: If you send a WhatsApp text, it takes 1 second whether the message is 5 words or 50 words (O(1)). If you read every single name in a phonebook of N people, it scales with N (O(N)).",
                        "code_example": "# O(1) Constant\ndef get_first(arr):\n    return arr[0]\n\n# O(N) Linear\ndef find_max(arr):\n    m = arr[0]\n    for x in arr:\n        if x > m: m = x\n    return m",
                        "interactive_question": "What is the time complexity of nested loops where each iterates up to N?",
                        "interactive_options_json": json.dumps([
                            "O(N)",
                            "O(N^2)",
                            "O(log N)",
                            "O(1)"
                        ]),
                        "interactive_answer": "O(N^2)",
                        "coding_challenge": "Write an O(N) function `find_maximum(nums)` that finds the highest number without sorting.",
                        "starter_code": "def find_maximum(nums):\n    # Find maximum in single pass O(N):\n    pass\n",
                        "solution_code": "def find_maximum(nums):\n    if not nums: return None\n    max_val = nums[0]\n    for x in nums[1:]:\n        if x > max_val:\n            max_val = x\n    return max_val",
                        "test_cases_json": json.dumps([
                            {"input": "find_maximum([3, 1, 9, 4])", "expected": "9", "hidden": False},
                            {"input": "find_maximum([-10, -5, -20])", "expected": "-5", "hidden": False}
                        ]),
                        "hint_1": "Keep track of current max with a single variable.",
                        "hint_2": "Iterate through the array once and update when you see a larger value.",
                        "hint_3": "max_val = nums[0]\nfor x in nums:\n    if x > max_val:\n        max_val = x\nreturn max_val",
                        "hint_4": "# See hint 3",
                        "mastery_check_prompt": "Write an O(N) function to find the minimum value.",
                        "mastery_check_starter": "def find_min(nums):\n    pass\n",
                        "mastery_check_solution": "def find_min(nums):\n    return min(nums)",
                        "mastery_check_tests_json": json.dumps([{"input": "find_min([4, 2, 7])", "expected": "2", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 4,
        "title": "Stage 4 — Data Structures",
        "description": "Arrays, Hash Tables, Linked Lists, Stacks, Queues, Heaps, and Trees.",
        "badge_name": "Data Structure Master",
        "modules": [
            {
                "title": "Module 5: Fundamental Data Structures",
                "description": "Organize data for high-performance retrieval and manipulation.",
                "lessons": [
                    {
                        "title": "Hash Tables & Two Sum Pattern",
                        "concept_key": "hash_tables",
                        "concept_explanation": "Hash tables provide O(1) average lookup. Instead of brute-forcing pairs with O(N^2) nested loops, store previously seen numbers in a hash map to solve compliment problems in O(N) time.",
                        "real_world_analogy": "A coat check room. Instead of searching through 500 coats to find yours (O(N)), you hand the attendant ticket #42, and they fetch it instantly from slot #42 (O(1)).",
                        "code_example": "# Two Sum in O(N)\ndef two_sum(nums, target):\n    seen = {}  # val -> index\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []",
                        "interactive_question": "Why is a hash map lookup average O(1) compared to a list search O(N)?",
                        "interactive_options_json": json.dumps([
                            "Hash maps are always smaller than lists",
                            "A hash function computes the memory index directly from the key",
                            "Hash maps use binary search internally",
                            "Python caches all variables"
                        ]),
                        "interactive_answer": "A hash function computes the memory index directly from the key",
                        "coding_challenge": "Implement `has_duplicate(nums)` in O(N) time using a set/hash table. Return True if any value appears at least twice, and False if every element is distinct.",
                        "starter_code": "def has_duplicate(nums):\n    # Return True if duplicate exists:\n    pass\n",
                        "solution_code": "def has_duplicate(nums):\n    seen = set()\n    for x in nums:\n        if x in seen:\n            return True\n        seen.add(x)\n    return False",
                        "test_cases_json": json.dumps([
                            {"input": "has_duplicate([1, 2, 3, 1])", "expected": "True", "hidden": False},
                            {"input": "has_duplicate([1, 2, 3, 4])", "expected": "False", "hidden": False}
                        ]),
                        "hint_1": "Use a Python set() to track elements you have already visited.",
                        "hint_2": "For each element, check `if x in seen: return True`.",
                        "hint_3": "Add x to the set on every iteration: `seen.add(x)`.",
                        "hint_4": "seen = set()\nfor x in nums:\n    if x in seen: return True\n    seen.add(x)\nreturn False",
                        "mastery_check_prompt": "Return True if len(nums) != len(set(nums)).",
                        "mastery_check_starter": "def check_dups(arr):\n    pass\n",
                        "mastery_check_solution": "def check_dups(arr):\n    return len(arr) != len(set(arr))",
                        "mastery_check_tests_json": json.dumps([{"input": "check_dups([1, 1])", "expected": "True", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 5,
        "title": "Stage 5 — Algorithms",
        "description": "Binary search, two pointers, sliding window, recursion, BFS/DFS, and dynamic programming.",
        "badge_name": "Algorithm Specialist",
        "modules": [
            {
                "title": "Module 6: Classic Algorithmic Patterns",
                "description": "Master patterns that appear in 90% of technical coding interviews.",
                "lessons": [
                    {
                        "title": "Binary Search: O(log N) Efficiency",
                        "concept_key": "binary_search",
                        "concept_explanation": "Binary Search finds the position of a target value within a sorted array. By comparing the target to the middle element, it eliminates half the remaining elements each step, resulting in O(log N) time.",
                        "real_world_analogy": "Looking up a name in a printed dictionary. You don't start at page 1. You flip to the middle (page 500). If the name starts with 'S', you instantly throw away pages 1 to 500 and repeat with the second half.",
                        "code_example": "def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
                        "interactive_question": "What is the prerequisite for running Binary Search on an array?",
                        "interactive_options_json": json.dumps([
                            "The array must contain only positive numbers",
                            "The array must be sorted",
                            "The array must have an even length",
                            "The array must have no duplicates"
                        ]),
                        "interactive_answer": "The array must be sorted",
                        "coding_challenge": "Write `binary_search(nums, target)` returning the index of target in sorted `nums`, or -1 if not found.",
                        "starter_code": "def binary_search(nums, target):\n    # Implement O(log N) binary search:\n    pass\n",
                        "solution_code": "def binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1",
                        "test_cases_json": json.dumps([
                            {"input": "binary_search([-1, 0, 3, 5, 9, 12], 9)", "expected": "4", "hidden": False},
                            {"input": "binary_search([-1, 0, 3, 5, 9, 12], 2)", "expected": "-1", "hidden": False}
                        ]),
                        "hint_1": "Set pointers `low = 0` and `high = len(nums) - 1`.",
                        "hint_2": "Calculate mid as `(low + high) // 2`.",
                        "hint_3": "Adjust low = mid + 1 or high = mid - 1.",
                        "hint_4": "# See example code above",
                        "mastery_check_prompt": "Find if target exists in sorted array returning boolean True/False.",
                        "mastery_check_starter": "def search_exists(nums, target):\n    pass\n",
                        "mastery_check_solution": "def search_exists(nums, target):\n    return target in nums",
                        "mastery_check_tests_json": json.dumps([{"input": "search_exists([1, 3, 5], 3)", "expected": "True", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 6,
        "title": "Stage 6 — Technical Interview Preparation",
        "description": "Live coding, system design basics, OS, Networks, SQL, and Behavioral STAR method.",
        "badge_name": "Interview Ready",
        "modules": [
            {
                "title": "Module 7: Interview Excellence",
                "description": "Excel across all rounds of modern technical interviews.",
                "lessons": [
                    {
                        "title": "The STAR Method for Behavioral Interviews",
                        "concept_key": "behavioral_star",
                        "concept_explanation": "Behavioral questions test leadership, resilience, conflict resolution, and teamwork. The STAR framework structures your response: Situation (set context), Task (your goal), Action (what YOU specifically did), and Result (quantifiable impact).",
                        "real_world_analogy": "A courtroom argument or movie pitch: You don't just say 'we had a problem and it was solved.' You paint the backdrop (Situation), state the dilemma (Task), show the heroic steps taken (Action), and reveal the triumphant outcome (Result).",
                        "code_example": "# Behavioral Framework Formula:\n# S: In 2024, our checkout API experienced 12% timeout spikes.\n# T: I was tasked with reducing latency below 200ms within 2 weeks.\n# A: I profiled DB queries, introduced Redis caching, and optimized indices.\n# R: Latency dropped by 64% and 99.9% uptime was restored.",
                        "interactive_question": "Which letter of STAR carries the most weight in assessing candidate contribution?",
                        "interactive_options_json": json.dumps([
                            "Situation",
                            "Task",
                            "Action",
                            "Result"
                        ]),
                        "interactive_answer": "Action",
                        "coding_challenge": "Write a function `star_score(situation, task, action, result)` that returns 100 if all 4 non-empty strings are provided, else 0.",
                        "starter_code": "def star_score(situation, task, action, result):\n    # Return 100 if all 4 components exist:\n    pass\n",
                        "solution_code": "def star_score(situation, task, action, result):\n    if all([situation.strip(), task.strip(), action.strip(), result.strip()]):\n        return 100\n    return 0",
                        "test_cases_json": json.dumps([
                            {"input": "star_score('S', 'T', 'A', 'R')", "expected": "100", "hidden": False},
                            {"input": "star_score('S', '', 'A', 'R')", "expected": "0", "hidden": False}
                        ]),
                        "hint_1": "Check that each of the four arguments is non-empty.",
                        "hint_2": "Use `all(...)` or `if situation and task and action and result:`.",
                        "hint_3": "return 100 if all([s, t, a, r]) else 0",
                        "hint_4": "# See hint 3",
                        "mastery_check_prompt": "Return True if all components have length > 5.",
                        "mastery_check_starter": "def valid_star(s, t, a, r):\n    pass\n",
                        "mastery_check_solution": "def valid_star(s, t, a, r):\n    return all(len(x) > 5 for x in [s, t, a, r])",
                        "mastery_check_tests_json": json.dumps([{"input": "valid_star('123456', '123456', '123456', '123456')", "expected": "True", "hidden": False}])
                    }
                ]
            }
        ]
    },
    {
        "stage_number": 7,
        "title": "Stage 7 — Company Preparation Tracks",
        "description": "Dedicated tracks for Google, Amazon, and Microsoft with documented patterns.",
        "badge_name": "FAANG Ready",
        "modules": [
            {
                "title": "Module 8: Company Rubrics & Tracks",
                "description": "Understand hiring rubrics, culture, and technical benchmarks.",
                "lessons": [
                    {
                        "title": "Google, Amazon, and Microsoft Interview Rubrics",
                        "concept_key": "company_tracks",
                        "concept_explanation": "Each major company has distinct interview emphasis: Google focuses on strong algorithmic depth, complexity trade-offs, and Googliness (collaboration, ambiguity). Amazon tests DSA + heavy focus on 16 Leadership Principles (Customer Obsession, Ownership, Dive Deep). Microsoft values clean code, maintainability, robust error handling, and collaborative system design.",
                        "real_world_analogy": "Applying to different universities: One judges you on theoretical math competitions (Google), another on demonstrated entrepreneurial leadership (Amazon), and another on real-world engineering teamwork and craftsmanship (Microsoft).",
                        "code_example": "company_focus = {\n    \"Google\": [\"Algorithms\", \"Time/Space Complexity\", \"Googliness\"],\n    \"Amazon\": [\"DSA\", \"OOP\", \"16 Leadership Principles\", \"Scalability\"],\n    \"Microsoft\": [\"Clean Code\", \"System Design\", \"Data Structures\", \"Growth Mindset\"]\n}",
                        "interactive_question": "Which company places the heaviest emphasis on Leadership Principles in every single round?",
                        "interactive_options_json": json.dumps([
                            "Google",
                            "Amazon",
                            "Microsoft",
                            "Apple"
                        ]),
                        "interactive_answer": "Amazon",
                        "coding_challenge": "Write a function `get_company_focus(company)` that returns the top priority string: 'Algorithmic Depth' for Google, 'Leadership Principles & DSA' for Amazon, and 'Engineering Craftsmanship' for Microsoft.",
                        "starter_code": "def get_company_focus(company):\n    # Return company focus:\n    pass\n",
                        "solution_code": "def get_company_focus(company):\n    mapping = {\n        \"Google\": \"Algorithmic Depth\",\n        \"Amazon\": \"Leadership Principles & DSA\",\n        \"Microsoft\": \"Engineering Craftsmanship\"\n    }\n    return mapping.get(company, \"General CS Prep\")",
                        "test_cases_json": json.dumps([
                            {"input": "get_company_focus('Google')", "expected": "Algorithmic Depth", "hidden": False},
                            {"input": "get_company_focus('Amazon')", "expected": "Leadership Principles & DSA", "hidden": False},
                            {"input": "get_company_focus('Microsoft')", "expected": "Engineering Craftsmanship", "hidden": False}
                        ]),
                        "hint_1": "Use a dictionary mapping company names to their focus string.",
                        "hint_2": "Use dict.get(company, fallback).",
                        "hint_3": "Return the mapped string.",
                        "hint_4": "# See solution code",
                        "mastery_check_prompt": "Return True if company is in ['Google', 'Amazon', 'Microsoft'].",
                        "mastery_check_starter": "def is_faang_target(c):\n    pass\n",
                        "mastery_check_solution": "def is_faang_target(c):\n    return c in ['Google', 'Amazon', 'Microsoft']",
                        "mastery_check_tests_json": json.dumps([{"input": "is_faang_target('Google')", "expected": "True", "hidden": False}])
                    }
                ]
            }
        ]
    }
]

CONCEPTS_SEED = [
    {"name": "print_and_comments", "display_name": "Print & Comments", "stage_number": 0, "category": "Foundations", "description": "Displaying output and writing code documentation."},
    {"name": "variables", "display_name": "Variables & Memory", "stage_number": 0, "category": "Foundations", "description": "Storing and naming data values in memory."},
    {"name": "data_types", "display_name": "Data Types & Casts", "stage_number": 0, "category": "Foundations", "description": "Int, Float, String, Bool, and conversions."},
    {"name": "operators", "display_name": "Operators & Math", "stage_number": 0, "category": "Foundations", "description": "Arithmetic, comparison, and boolean expressions."},
    {"name": "conditionals", "display_name": "If / Elif / Else", "stage_number": 1, "category": "Fundamentals", "description": "Branching and decision-making logic."},
    {"name": "loops", "display_name": "For & While Loops", "stage_number": 1, "category": "Fundamentals", "description": "Iteration, range, break, and continue."},
    {"name": "strings_lists", "display_name": "Strings & Lists", "stage_number": 1, "category": "Fundamentals", "description": "Sequences, slicing, and 0-based indexing."},
    {"name": "dictionaries", "display_name": "Dictionaries & Sets", "stage_number": 1, "category": "Fundamentals", "description": "Key-value hashing and unique collections."},
    {"name": "functions", "display_name": "Functions & Scope", "stage_number": 1, "category": "Fundamentals", "description": "Parameters, return values, and variable scope."},
    {"name": "list_comprehensions", "display_name": "Comprehensions & Lambdas", "stage_number": 2, "category": "Intermediate", "description": "Concise transformations and anonymous functions."},
    {"name": "error_handling", "display_name": "Exceptions & Debugging", "stage_number": 2, "category": "Intermediate", "description": "Try/except blocks and defensive programming."},
    {"name": "oop", "display_name": "Classes & OOP", "stage_number": 2, "category": "Intermediate", "description": "Encapsulation, inheritance, and methods."},
    {"name": "big_o", "display_name": "Big-O Complexity", "stage_number": 3, "category": "Problem Solving", "description": "Time and space scalability analysis."},
    {"name": "hash_tables", "display_name": "Hash Tables & Fast Lookup", "stage_number": 4, "category": "Data Structures", "description": "O(1) lookups and frequency tracking."},
    {"name": "stacks_queues", "display_name": "Stacks & Queues", "stage_number": 4, "category": "Data Structures", "description": "LIFO and FIFO ordering semantics."},
    {"name": "trees_graphs", "display_name": "Trees & Graphs", "stage_number": 4, "category": "Data Structures", "description": "Hierarchical structures, BFS, and DFS."},
    {"name": "binary_search", "display_name": "Binary Search", "stage_number": 5, "category": "Algorithms", "description": "O(log N) search on sorted data."},
    {"name": "two_pointers", "display_name": "Two Pointers & Sliding Window", "stage_number": 5, "category": "Algorithms", "description": "Multi-pointer array optimization."},
    {"name": "dynamic_programming", "display_name": "Recursion & DP", "stage_number": 5, "category": "Algorithms", "description": "Subproblem decomposition and memoization."},
    {"name": "behavioral_star", "display_name": "Behavioral STAR Method", "stage_number": 6, "category": "Interview", "description": "Situation, Task, Action, Result storytelling."},
    {"name": "company_tracks", "display_name": "FAANG Tracks", "stage_number": 7, "category": "Interview", "description": "Google, Amazon, Microsoft specific prep."}
]

PROBLEMS_SEED = [
    {
        "title": "Two Sum (O(N) Hash Map)",
        "slug": "two-sum",
        "difficulty": "Easy",
        "category": "Hash Tables",
        "stage_number": 4,
        "company_tags": "Google,Amazon,Microsoft",
        "description": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "starter_code": "def two_sum(nums, target):\n    # Return [index1, index2]:\n    pass\n",
        "solution_code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
        "test_cases_json": json.dumps([
            {"input": "two_sum([2, 7, 11, 15], 9)", "expected": "[0, 1]", "hidden": False},
            {"input": "two_sum([3, 2, 4], 6)", "expected": "[1, 2]", "hidden": False},
            {"input": "two_sum([3, 3], 6)", "expected": "[0, 1]", "hidden": False}
        ]),
        "hint_1": "Instead of checking every pair with nested loops in O(N^2), can you remember numbers you've seen?",
        "hint_2": "For each number `x`, what you need is `target - x` (the complement).",
        "hint_3": "Use a dictionary `seen = {}` where keys are values and values are indices.",
        "hint_4": "seen = {}\nfor i, num in enumerate(nums):\n    comp = target - num\n    if comp in seen: return [seen[comp], i]\n    seen[num] = i"
    },
    {
        "title": "Valid Anagram",
        "slug": "valid-anagram",
        "difficulty": "Beginner",
        "category": "Strings & Hashing",
        "stage_number": 1,
        "company_tags": "Google,Amazon",
        "description": "Given two strings `s` and `t`, return `True` if `t` is an anagram of `s`, and `False` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, using all the original letters exactly once.",
        "starter_code": "def is_anagram(s, t):\n    # Return True if anagram, else False:\n    pass\n",
        "solution_code": "def is_anagram(s, t):\n    return sorted(s) == sorted(t)",
        "test_cases_json": json.dumps([
            {"input": "is_anagram('anagram', 'nagaram')", "expected": "True", "hidden": False},
            {"input": "is_anagram('rat', 'car')", "expected": "False", "hidden": False}
        ]),
        "hint_1": "If two words are anagrams, what happens when you sort their letters?",
        "hint_2": "Check if lengths are equal first.",
        "hint_3": "Compare sorted(s) == sorted(t), or count frequencies with a dictionary.",
        "hint_4": "return sorted(s) == sorted(t)"
    },
    {
        "title": "Reverse a Linked List Concept",
        "slug": "reverse-list",
        "difficulty": "Medium",
        "category": "Data Structures",
        "stage_number": 4,
        "company_tags": "Microsoft,Amazon",
        "description": "Write a function `reverse_list(arr)` that reverses a sequence in O(N) time and O(1) auxiliary space using two pointers.",
        "starter_code": "def reverse_list(arr):\n    # Reverse arr in-place using two pointers:\n    pass\n",
        "solution_code": "def reverse_list(arr):\n    left, right = 0, len(arr) - 1\n    while left < right:\n        arr[left], arr[right] = arr[right], arr[left]\n        left += 1\n        right -= 1\n    return arr",
        "test_cases_json": json.dumps([
            {"input": "reverse_list([1, 2, 3, 4, 5])", "expected": "[5, 4, 3, 2, 1]", "hidden": False},
            {"input": "reverse_list(['a', 'b'])", "expected": "['b', 'a']", "hidden": False}
        ]),
        "hint_1": "Place one pointer at index 0 and one pointer at index len - 1.",
        "hint_2": "Swap the two elements, then increment left and decrement right.",
        "hint_3": "Stop when left >= right.",
        "hint_4": "left, right = 0, len(arr) - 1\nwhile left < right:\n    arr[left], arr[right] = arr[right], arr[left]\n    left += 1; right -= 1\nreturn arr"
    }
]

async def seed_database(db: AsyncSession):
    """Populates stages, modules, lessons, concepts, and practice problems."""
    # Check if already seeded
    existing = await db.execute(select(CourseStage))
    if existing.scalars().first():
        return

    # 1. Seed Concepts
    for c_data in CONCEPTS_SEED:
        concept = Concept(**c_data)
        db.add(concept)

    # 2. Seed Stages, Modules, Lessons
    for s_data in CURRICULUM_DATA:
        stage = CourseStage(
            stage_number=s_data["stage_number"],
            title=s_data["title"],
            description=s_data["description"],
            badge_name=s_data["badge_name"]
        )
        db.add(stage)
        await db.flush()

        for m_idx, m_data in enumerate(s_data.get("modules", [])):
            module = Module(
                stage_id=stage.id,
                title=m_data["title"],
                description=m_data["description"],
                order_index=m_idx
            )
            db.add(module)
            await db.flush()

            for l_idx, l_data in enumerate(m_data.get("lessons", [])):
                lesson = Lesson(
                    module_id=module.id,
                    title=l_data["title"],
                    concept_key=l_data["concept_key"],
                    concept_explanation=l_data["concept_explanation"],
                    real_world_analogy=l_data["real_world_analogy"],
                    code_example=l_data["code_example"],
                    interactive_question=l_data["interactive_question"],
                    interactive_options_json=l_data["interactive_options_json"],
                    interactive_answer=l_data["interactive_answer"],
                    coding_challenge=l_data["coding_challenge"],
                    starter_code=l_data["starter_code"],
                    solution_code=l_data["solution_code"],
                    test_cases_json=l_data["test_cases_json"],
                    hint_1=l_data["hint_1"],
                    hint_2=l_data["hint_2"],
                    hint_3=l_data["hint_3"],
                    hint_4=l_data["hint_4"],
                    mastery_check_prompt=l_data["mastery_check_prompt"],
                    mastery_check_starter=l_data["mastery_check_starter"],
                    mastery_check_solution=l_data["mastery_check_solution"],
                    mastery_check_tests_json=l_data["mastery_check_tests_json"],
                    order_index=l_idx
                )
                db.add(lesson)

    # 3. Seed Practice Problems
    for p_data in PROBLEMS_SEED:
        problem = Problem(**p_data)
        db.add(problem)

    await db.commit()
