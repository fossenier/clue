"""
Test suites for clue algorithm.
"""

from testing_utilities import merge_and_fix_keys

from T_helpers import HELPERS_CALLABLES, HELPERS_ASSERTIONS, HELPERS_SUITES

# setup constant to access the callables dynamically
CALLABLES = merge_and_fix_keys(HELPERS_CALLABLES)
# setup test suites to run through
SUITES = merge_and_fix_keys(HELPERS_SUITES)

ASSERTIONS = HELPERS_ASSERTIONS  # remember use or | to combine the assertions


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
        ) = (
            test["assertion"],
            test["callable"],
            test["class"],
            test["description"],
            test["expected"],
            test["parameters"],
        )
        # run the corresponding class method / function with the given parameters
        if class_instance:
            test_callable = getattr(class_instance, CALLABLES[callable_key])
        else:
            test_callable = CALLABLES[callable_key]
        actual = test_callable(*parameters)
        if not ASSERTIONS[assertion_key](actual, *expected):
            # print an informative message
            print(
                f"FAIL   |   Potential error in case: `{description}`   |   Ran: {CALLABLES[callable_key + '_name']}   Parameters: {parameters}   Expected: {expected}   Actual: {actual} "
            )

# give user feedback upon completion
print("*** Test script completed ***")
