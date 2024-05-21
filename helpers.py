"""
This is a module for the third slice of Clue.
It houses all helper functions.
"""


def search_within(search_item, search_list):
    """
    This function sees if search_string is a part of any of the strings in search_list.

    rtype str or None
    """
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
