"""
This is a third slice of Clue.
It directs the player like a puppet to play the game.
"""

import pickle
import sys

from config import BOARD_PATH

from board import Board
from detective_notes import DetectiveNotes
from user_interface import UI


class ClueAlgorithm(object):
    def __init__(self, board_path):
        # read in board
        self.__board = Board(board_path)
        # initialize user interface object
        self.__USER_COMMANDS = {
            "save": self.save_game,
        }
        self.__ui = UI(self.__USER_COMMANDS)
        # get player order
        self.__player_order = self.__ui.game_order(self.__board.suspects())
        # initialize detective notes object
        self.__notes = DetectiveNotes(
            self.__board.suspects(),
            self.__board.weapons(),
            self.__board.rooms(),
            self.__player_order,
            self.__ui.sidebar(self.__board.cards()),
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

    def run(self):
        """
        Runs the Clue game.
        """
        cpu_accusation_made = False
        while not cpu_accusation_made:
            for player in self.__player_order:
                self.__notes.draw()

                # handle the cpu turn
                if player == self.__cpu_player:
                    cpu_accusation_made = self.__cpu_turn()
                # handle human turns
                else:
                    self.__human_turn(player)

    def save_game(self, file_name="game_state.pkl"):
        """
        Saves the current game state to a file.
        """
        if not file_name.endswith(".pkl"):
            file_name += ".pkl"
        with open(file_name, "wb") as file:
            pickle.dump(self, file)
        print(f"Game state saved to {file_name}.")

    def __cpu_turn(self):
        """
        Handles the CPU player's turn.
        """
        # makes a final accusation when it is guaranteed
        accusation = self.__notes.final_accusation()
        if accusation:
            self.__ui.final_accusation(self.__cpu_player, accusation)
            return True
        
        


def main():
    algorithm = None

    # read from CLI arguments
    if len(sys.argv) < 2:
        argument = ""
    else:
        argument = sys.argv[1]

    if argument.startswith("--state="):
        state_path = argument.split("=")[1]
        # load a state object from file
        with open(f"{state_path}.pkl", "rb") as file:
            algorithm = pickle.load(file)
    else:
        algorithm = ClueAlgorithm(BOARD_PATH)

    algorithm.run()


if __name__ == "__main__":
    main()