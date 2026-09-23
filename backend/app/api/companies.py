from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/companies", tags=["companies"])

COMPANY_TRACKS_DATA = [
    {
        "company": "Google",
        "tagline": "Algorithmic Depth & Scalable Complexity",
        "badge_color": "blue",
        "description": "Google interviews heavily test your ability to break down complex, often ambiguous problems, discover optimal time and space trade-offs, and write clean, idiomatic code on a shared whiteboard or editor.",
        "core_pillars": [
            {
                "pillar": "Data Structures & Algorithms",
                "weight": "45%",
                "details": "Heaps, Hash Maps, Graphs (BFS/DFS, Topological Sort), Binary Search, Two Pointers, Dynamic Programming."
            },
            {
                "pillar": "Time & Space Complexity",
                "weight": "25%",
                "details": "Must calculate and explain exact Big-O before coding. Be ready to discuss worst-case vs amortized runtime."
            },
            {
                "pillar": "Googliness & Navigation of Ambiguity",
                "weight": "30%",
                "details": "Do you ask clarifying questions? How do you respond to hints? Do you display intellectual humility and teamwork?"
            }
        ],
        "top_patterns": [
            "Binary Search on Answer Range",
            "Graph Connected Components & Cycle Detection",
            "Sliding Window with Hash Map",
            "Prefix Sums & Monotonic Queue"
        ],
        "interview_rounds": [
            "Round 1: 45-min Algorithmic Coding Screen",
            "Round 2: Onsite DSA Round 1 (Trees / Graphs)",
            "Round 3: Onsite DSA Round 2 (Arrays / DP / Strings)",
            "Round 4: System Design / Architecture (L4+)",
            "Round 5: Googliness & Leadership Behavioral"
        ],
        "preparation_advice": "Never jump into code immediately. Spend the first 5 minutes stating assumptions, asking clarifying questions, dry-running an example by hand, and getting buy-in on your approach."
    },
    {
        "company": "Amazon",
        "tagline": "DSA, OOP & 16 Leadership Principles",
        "badge_color": "amber",
        "description": "Amazon evaluates candidates on both strong coding fundamentals and strict alignment with their 16 Leadership Principles (LPs). Every single interviewer tests at least two LPs using deep-dive behavioral questions.",
        "core_pillars": [
            {
                "pillar": "16 Leadership Principles",
                "weight": "40%",
                "details": "Customer Obsession, Ownership, Bias for Action, Dive Deep, Earn Trust, Invent and Simplify, Deliver Results."
            },
            {
                "pillar": "Data Structures & Coding",
                "weight": "40%",
                "details": "Hash Maps, Priority Queues, Trees, Binary Search, Linked Lists, Matrix traversals."
            },
            {
                "pillar": "Object-Oriented Design & Craftsmanship",
                "weight": "20%",
                "details": "Clean modular classes, encapsulation, SOLID principles, defensive error handling."
            }
        ],
        "top_patterns": [
            "Top-K Elements using Min/Max Heap",
            "Two Sum & Frequency Counting",
            "Breadth-First Search (Shortest Path in Grid)",
            "LRU Cache Design (Hash Map + Doubly Linked List)"
        ],
        "interview_rounds": [
            "Round 1: Online Assessment (OA) — 2 Coding Questions + Work Simulation",
            "Round 2: Technical Phone Screen (DSA + 2 LP questions)",
            "Round 3-6: The 'Loop' (4 Onsite Rounds including Bar Raiser)"
        ],
        "preparation_advice": "Prepare 6–8 distinct stories from your past experience mapped to Amazon LPs formatted using the STAR method. Ensure you highlight YOUR specific actions rather than what the team did."
    },
    {
        "company": "Microsoft",
        "tagline": "Production Engineering, CS Fundamentals & Growth Mindset",
        "badge_color": "emerald",
        "description": "Microsoft looks for well-rounded software engineers with rock-solid coding craftsmanship, attention to edge cases, knowledge of computer science fundamentals (OS, concurrency, memory), and a growth mindset.",
        "core_pillars": [
            {
                "pillar": "Coding & Clean Code",
                "weight": "40%",
                "details": "Clean variable naming, robust validation, handling null/empty inputs, avoiding off-by-one errors."
            },
            {
                "pillar": "CS Fundamentals",
                "weight": "30%",
                "details": "Processes vs Threads, Concurrency, Virtual Memory, Database indices, REST APIs."
            },
            {
                "pillar": "Growth Mindset & Culture",
                "weight": "30%",
                "details": "How do you learn from failure? Receptiveness to feedback during the interview."
            }
        ],
        "top_patterns": [
            "String Parsing & Palindromes",
            "Linked List Reversal & Cycle Detection",
            "Binary Tree Invert & Lowest Common Ancestor",
            "Two Pointers for Array Partitioning"
        ],
        "interview_rounds": [
            "Round 1: Codility Technical Screen",
            "Round 2: Virtual Onsite Round 1 (Data Structures)",
            "Round 3: Virtual Onsite Round 2 (Algorithms & Edge Cases)",
            "Round 4: Virtual Onsite Round 3 (CS Fundamentals / System Design)",
            "Round 5: Hiring Manager Chat (Growth Mindset & Fit)"
        ],
        "preparation_advice": "Write code that looks ready for a production pull request. Include comments where helpful, check edge cases (empty list, null values, single element), and test your code mentally before saying you're done."
    }
]

@router.get("/tracks")
async def get_company_tracks():
    return COMPANY_TRACKS_DATA
