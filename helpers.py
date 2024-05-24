"""
This is a module for the third slice of Clue.
It houses all helper functions.
"""


def search_within(search_item, search_list):
    """
    This function sees if search_item (str, int) is a part of any of the items in search_list.

    Will return None if search_item or search_list do not exist.
    rtype str or int or None
    """
    if not search_item or not search_list or search_list == []:
        return None

    # TODO handle this case but account for sets and list input
    # if type(search_item) != type(search_list[0]):
    #     raise TypeError("search_item and search_list must be of the same type")

    if type(search_item) is type(""):
        for string in search_list:
            if search_item.lower() in string.lower():
                return string
        return None
    if type(search_item) is type(0):
        for int in search_list:
            if search_item == int:
                return int


class Node:
    def __init__(self, state, parent, action, turn_cost=0, steps_taken=0):
        self.state = state
        self.parent = parent
        self.action = action
        self.turn_cost = turn_cost
        self.steps_taken = steps_taken


class StackFrontier:
    def __init__(self):
        self.frontier = []

    def add(self, node):
        self.frontier.append(node)

    def contains_state(self, state):
        return any(node.state == state for node in self.frontier)

    def empty(self):
        return len(self.frontier) == 0

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:
            node = self.frontier[-1]
            self.frontier = self.frontier[:-1]
            return node


class QueueFrontier(StackFrontier):

    def remove(self):
        if self.empty():
            raise Exception("empty frontier")
        else:
            node = self.frontier[0]
            self.frontier = self.frontier[1:]
            return node
