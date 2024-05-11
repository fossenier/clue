"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding suggestions.
"""


class DetectiveNotes(object):
    def __init__(self, suspects, weapons, rooms, players, hand_size):
        # raw game details
        self.__cards = suspects.union(weapons).union(rooms)
        self.__hand_size = hand_size
        self.__players = players
        self.__rooms = rooms
        self.__suspects = suspects
        self.__weapons = weapons

        # 2D dictionary to store gained card information
        # None -> no data, True -> has card, False -> does not have card
        self.__notes = {
            player: {card: None for card in self.__cards} for player in self.__players
        }
