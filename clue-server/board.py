"""
This is the module that keeps track of the board
state for my Web implementation of Clue.
"""

import pandas as pd


class Board(object):
    def __init__(self, board_path: str) -> None:
        """
        Initializes a Clue board.

        Raises a ValueError if the board_path has issues.

        str board_path: path to Clue board .csv file.
        """
        # Game state.
        self.board = pd.DataFrame()
        # Game details.
        self.rooms = pd.Series()
        self.suspects = pd.Series()
        self.weapons = pd.Series()

        # Current suspect locations given as (y, x) coordinates.
        self.suspect_locations = dict()  # {str: (int, int)}

        self.read_board(board_path)
        self.find_suspects()

    def find_suspects(self) -> None:
        """
        Finds the locations of the suspects and populates self.suspect_locations.
        """
        for y, row in self.board.iterrows():
            for x, cell in row.items():
                if cell in self.suspects.values:
                    self.suspect_locations[cell] = (y, x)
                    self.board.at[y, x] = " "

    def read_board(self, board_path: str) -> None:
        """
        Reads a Clue board from a .csv file.

        Populates self.board, self.rooms, self.suspects, and self.weapons."""
        with open(board_path, "r") as file:
            # Read the first three lines into Series.
            self.rooms = pd.Series(file.readline().strip().split(","))
            self.suspects = pd.Series(file.readline().strip().split(","))
            self.weapons = pd.Series(file.readline().strip().split(","))

            # Read the remaining lines into a DataFrame.
            self.board = pd.read_csv(file, header=None)
