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

        # get cpu player
        self.__cpu_player = self.__ui.cpu_player(self.__player_order)
        # get player hand
        self.__hand = self.__ui.hand(
            self.__cpu_player, self.__player_order, self.__board.cards()
        )
        sidebar_size = len(self.__board.cards()) % len(self.__player_order)

        # initialize detective notes object
        self.__notes = DetectiveNotes(
            self.__board.suspects(),
            self.__board.weapons(),
            self.__board.rooms(),
            self.__player_order,
            self.__ui.sidebar(self.__board.cards(), self.__hand, sidebar_size),
        )

        # populate detective notes with hand
        for card in self.__hand:
            self.__notes.reveal_card(self.__cpu_player, card)

    def run(self):
        """
        Runs the Clue game.
        """
        accused = False
        while not accused:
            for player in self.__player_order:
                # update visuals
                self.__board.draw(self.__cpu_player)
                self.__notes.draw()

                # run the turn
                if player == self.__cpu_player:
                    accused = self.__cpu_turn()
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

        # gets roll
        roll = self.__ui.roll(self.__cpu_player)

        # explore possible moves
        action_space = self.__board.path_agent(self.__cpu_player, roll)
        path_data = action_space[1]

        # pick destination
        rooms_turn_costs = action_space[0]
        desired_room = self.__notes.pick_room(rooms_turn_costs)

        # travel to destination
        self.__board.move_player(self.__cpu_player, desired_room, roll, path_data)
        self.__board.draw(self.__cpu_player)

        # make suggestion if in a room
        room = self.__board.check_room(self.__cpu_player)
        if room:
            suggestion = self.__notes.make_suggestion(room)
            # update detective notes
            for player, response in self.__ui.suggestion(
                self.__cpu_player, self.__player_order, suggestion
            ):
                if response:
                    self.__notes.reveal_card(player, response)
                else:
                    self.__notes.denied_suggestion(player, suggestion)

        return False

    def __human_turn(self, active_player):
        """
        Handles the human player's turn.
        """
        suspects = self.__board.suspects()
        weapons = self.__board.weapons()
        rooms = self.__board.rooms()
        for suggestion, player_response in self.__ui.human_suggestion(
            active_player, self.__player_order, suspects, weapons, rooms
        ):
            player, response = player_response
            if response:
                self.__notes.make_link(player, suggestion)
            else:
                self.__notes.denied_suggestion(player, suggestion)

        return


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
        with open(
            f"/Users/admin/projects/monorepo/clue/{state_path}.pkl", "rb"
        ) as file:
            algorithm = pickle.load(file)
    else:
        algorithm = ClueAlgorithm(BOARD_PATH)

    algorithm.run()


if __name__ == "__main__":
    main()
