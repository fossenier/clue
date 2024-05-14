"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding suggestions.
"""

from config import HAND_SIZE


class DetectiveNotes(object):
    def __init__(self, suspects, weapons, rooms, players, sidebar):
        # raw game details
        self.__cards = suspects.union(weapons).union(rooms)
        self.__hand_size = HAND_SIZE[len(players)]
        self.__players = players
        self.__rooms = rooms
        self.__sidebar = sidebar
        self.__suspects = suspects
        self.__weapons = weapons

        # 2D dictionary to store gained card information
        # None -> no data, True -> has card, False -> does not have card
        self.__notes = {
            player: {card: None for card in self.__cards} for player in self.__players
        }

    def reveal_card(self, player, card):
        """
        Marks when a player's card is revealed.

        str player: player who revealed the card.
        str card: card that was revealed.
        """
        self.__notes[player][card] = True
