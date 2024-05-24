"""
Test suites for clue algorithm.
"""

from testing_utilities import merge_and_fix_keys

from T_helpers import HELPERS_CALLABLES, HELPERS_ASSERTIONS, HELPERS_SUITES
from T_board import BOARD_CALLABLES, BOARD_ASSERTIONS, BOARD_SUITES

# setup constant to access the callables dynamically
CALLABLES = merge_and_fix_keys(HELPERS_CALLABLES, BOARD_CALLABLES)
# setup test suites to run through
SUITES = merge_and_fix_keys(HELPERS_SUITES, BOARD_SUITES)

ASSERTIONS = (
    HELPERS_ASSERTIONS | BOARD_ASSERTIONS
)  # remember use or | to combine the assertions


# run each suite
for suite_key in SUITES:
    # run each test
    for test in SUITES[suite_key]:
        (
            assertion_key,
            callable_key,
            class_instance,
            description,
            expected,
            parameters,
            returns,
        ) = (
            test["assertion"],
            test["callable"],
            test["class"],
            test["description"],
            test["expected"],
            test["parameters"],
            test["returns"],
        )
        # run the corresponding class method / function with the given parameters
        if class_instance:
            test_callable = getattr(class_instance, CALLABLES[callable_key])
        else:
            test_callable = CALLABLES[callable_key]

        actual = None
        try:
            actual = test_callable(*parameters)
        except Exception as e:
            actual = type(e)

        # set actual to point to the input if we do not expect a return value
        if not returns:
            actual = parameters[0]

        if not ASSERTIONS[assertion_key](actual, *expected):
            # print an informative message
            print(
                f"FAIL   |   Potential error in case: `{description}`   |   Ran: {CALLABLES[callable_key + '_name']}   Parameters: {parameters}   Expected: {expected}   Actual: {actual} "
            )

# give user feedback upon completion
print("*** Test script completed ***")
