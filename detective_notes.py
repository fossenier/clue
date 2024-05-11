"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding suggestions.
"""


class DetectiveNotes(object):
    def __init__(self, suspects, weapons, rooms, players):
        self.test = "test"
        self.cards = suspects.union(weapons).union(rooms)
