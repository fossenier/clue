"""
This is a module for the third slice of Clue.
It houses all helper functions.
"""


def search_within(search_string, search_list):
    """
    This function sees if search_string is a part of any of the strings in search_list.

    rtype str or None
    """
    for string in search_list:
        if search_string in string:
            return string
    return None
