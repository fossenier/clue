"""
This is a third slice of Clue.
It directs the player like a puppet to play the game.
"""

from config import BOARD_PATH

from board import Board
from detective_notes import DetectiveNotes
from user_interface import UI


class ClueAlgorithm(object):
    def __init__(self, board_path):
        # read in board
        self.__board = Board(board_path)
        # initialize user interface object
        self.__ui = UI()
        # get player order and cpu player
        self.__player_order = self.__ui.game_order(self.__board.suspects())
        self.__sidebar = self.__ui.sidebar(self.__board.cards())
        # initialize detective notes object
        self.__notes = DetectiveNotes(
            self.__board.suspects(),
            self.__board.weapons(),
            self.__board.rooms(),
            self.__player_order,
        )

        # get cpu player
        self.__cpu_player = self.__ui.cpu_player(self.__player_order)
        # get player hand
        self.__hand = self.__ui.hand(
            self.__cpu_player, self.__player_order, self.__board.cards()
        )
        # populate detective notes with hand
        for card in self.__hand:
            self.__notes.reveal_card(self.__cpu_player, card)


def main():
    algorithm = ClueAlgorithm(BOARD_PATH)


if __name__ == "__main__":
    main()
