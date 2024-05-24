"""
Test suites for helpers.py
"""

import sys
import os

current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)


from helpers import search_within
from testing_utilities import assertion_equality

# setup constant to access the callables dynamically
HELPERS_CALLABLES = {
    "c1": search_within,
    "c1_name": "search_within()",
}
HELPERS_ASSERTIONS = {
    "equality": assertion_equality,
}

# setup test suites to run through
HELPERS_SUITES = {
    "c1_black_box": [
        {
            "assertion": "list_content_equality",
            "callable": "c1",
            "class": None,
            "description": "create() happy path: calling the method",
            "expected": (
                [
                    "HA",
                ],
            ),
            "parameters": (),
        },
    ],
}
