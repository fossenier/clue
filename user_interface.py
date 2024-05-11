"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from helpers import search_within


class UI(object):
    def __init__(self):
        print("Welcome to Clue!")

    def game_order(self, suspects):
        """
        Asks the user for the order of the players in the game.

        rtype [str]
        """
        game_order = None
        while not game_order:
            # get user input
            players_raw = input("Enter the order of the players, separated by commas: ")
            players = [player.strip() for player in players_raw.split(",")]
            # match input to suspects
            validated_players = [search_within(player, suspects) for player in players]

            # tell the user if an input was not valid
            for i, validated_player in enumerate(validated_players):
                if not validated_player:
                    print(f"Player {players[i]} not found.")
                    break

            if all(validated_players):
                game_order = validated_players

        return game_order
