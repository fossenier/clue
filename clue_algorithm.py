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
        # get player order and hand
        self.__player_order = self.ui.game_order(self.board.suspects())

        # initialize detective notes object
        self.__notes = DetectiveNotes(
            self.__board.suspects(),
            self.__board.weapons(),
            self.__board.rooms(),
            self.__player_order,
            self.__hand_size,
        )

    def test(self):
        print(self.notes.cards)
        print(self.ui.test)


def main():
    algorithm = ClueAlgorithm(BOARD_PATH)
    algorithm.test()


if __name__ == "__main__":
    main()
