"""
Test suites for helpers.py
"""

import sys
import os

current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)


from helpers import search_within
from testing_utilities import assertion_equality, assertion_error_raised

# setup constant to access the callables dynamically
HELPERS_CALLABLES = {
    "c1": search_within,
    "c1_name": "search_within()",
}
HELPERS_ASSERTIONS = {
    "equality": assertion_equality,
    "error_raised": assertion_error_raised,
}

# setup test suites to run through
HELPERS_SUITES = {
    "c1": [
        {
            "assertion": "equality",
            "callable": "c1",
            "class": None,
            "description": "search_within() happy path: single item integer list",
            "expected": (1,),
            "parameters": (1, [1]),
            "returns": True,
        },
        {
            "assertion": "equality",
            "callable": "c1",
            "class": None,
            "description": "search_within() happy path: substring",
            "expected": ("Mustard",),
            "parameters": ("ust", ["Mustard", "Cherry"]),
            "returns": True,
        },
        {
            "assertion": "equality",
            "callable": "c1",
            "class": None,
            "description": "search_within() happy path: empty list",
            "expected": (None,),
            "parameters": ("ust", []),
            "returns": True,
        },
        {
            "assertion": "error_raised",
            "callable": "c1",
            "class": None,
            "description": "search_within() unhappy path: mismatched types",
            "expected": (TypeError,),
            "parameters": ("ust", [1, 2]),
            "returns": True,
        },
        {
            "assertion": "equality",
            "callable": "c1",
            "class": None,
            "description": "search_within() happy path: numbers must match not be substrings",
            "expected": (None,),
            "parameters": (2, [12, 21, 102]),
            "returns": True,
        },
    ],
}
