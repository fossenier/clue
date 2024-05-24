"""
Logan Fossenier's testing utilities he uses to make writing tests easier.
"""

from typing import Dict, List


def merge_and_fix_keys(*dicts: Dict):
    """
    Purpose:
        Merges multiple dictionaries and fixes keys with conflicts by incrementing the numerical part.
    Pre-conditions:
        *dicts Dict: Any number of dictionaries to be merged.
        WARNING: Keys must begin with a single letter prefix, followed by a two-digit number, and end with a suffix.
        i.e. "c01_callable_name"
    Post-conditions:
        None.
    Returns:
        dict: A single merged dictionary with fixed keys.
    """

    def increment_key(key):
        # split key into parts: prefix (c) and number (01_)
        prefix = key[:1]
        number = key[1:3]
        suffix = key[3:]
        incremented_number = int(number) + 1
        incremented_key = f"{prefix}{incremented_number:02d}{suffix}"
        return incremented_key

    merged_dict = {}

    for d in dicts:
        for key, value in d.items():
            if key in merged_dict:
                new_key = increment_key(key)
                while new_key in merged_dict:
                    new_key = increment_key(new_key)
                merged_dict[new_key] = value
            else:
                merged_dict[key] = value

    return merged_dict


def assertion_epsilon_close(number1: float, number2: float, epsilon: float) -> bool:
    """
    Purpose:
        Checks if two numbers are epsilon close.
    Pre-conditions:
        float number1: Any number.
        float number2: Any number.
        float epsilon: Any number for the difference to be less than.
    Post-conditions:
        None.
    Return:
        bool: Truthy value for the result of the comparison.
    """
    return abs(number1 - number2) < epsilon


def assertion_equality(item1: any, item2: any) -> bool:
    """
    Purpose:
        Checks if two items are equal.
    Pre-conditions:
        any item1: Any item.
        any item2: Any item.
    Post-conditions:
        None.
    Return:
        bool: Truthy value for the result of the comparison.
    """
    return item1 == item2


def assertion_error_raised(error1: BaseException, error2: BaseException) -> bool:
    """
    Purpose:
        Checks if the correct error is raised.
    Pre-conditions:
        error1 BaseException: Any error.
        error2 BaseException: Any error.
    Post-conditions:
        None.
    Returns:
        bool: Truthy value for the result of the comparison
    """
    # the same as assertion_equality, just a more meaningful name for handling exceptions
    return error1 == error2


def assertion_list_content_equality(list1: List[any], list2: List[any]) -> bool:
    """
    Purpose:
        Checks if two lists contain the exact same contents.
    Pre-conditions:
        list1 List[any]: A list.
        list2 List[any]: A list.
    Post-conditions:
        None.
    Return:
        bool: Truthy value for the result of the comparison.
    """
    return recursive_list_sort(list1) == recursive_list_sort(list2)


def assertion_list_shape(list1: List[any], list_size: int, sublist_size: int) -> bool:
    """
    Purpose:
        Checks if a list and its contents match a certain size.
    Pre-conditions:
        list1 List[any]: A list.
        list_size int: Desired size of list.
        sublist_size int: Desired size of sublist(s).
    Post-conditions:
        None.
    Return:
        bool: Truthy value for the result of the comparison.
    """
    list_properly_sized = len(list1) == list_size
    sublists_properly_sized = True
    for item in list1:
        if type(item) is list:
            if len(item) != sublist_size:
                sublists_properly_sized = False
    return list_properly_sized and sublists_properly_sized


def recursive_list_sort(unsorted_list: List[any]):
    """
    Purpose:
        Recursively dive into a list following the same rule, and sort each sublist encountered.
    Pre-conditions:
        unsorted_list List[any]: a list potentially containing lists and also containing exclusively one of int / float / str.
    Post-conditions:
        None.
    Return:
        List[any]: The sorted list.
    """
    # copy the list to leave the original untouched
    sorted_list = unsorted_list.copy()
    lists = []
    # mark down each sublist
    for item in sorted_list:
        if type(item) is list:
            lists.append(item)
    # remove each sublist from the sorted list, and then sort it in spot
    for i in range(len(lists)):
        sorted_list.remove(lists[i])
        lists[i] = recursive_list_sort(lists[i])
    # sort the copied list, now that the sublists are gone
    sorted_list.sort()
    # add back the now sorted lists
    sorted_list.extend(lists)
    return sorted_list
