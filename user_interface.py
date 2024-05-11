"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from config import MIN_PLAYERS
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

            # make sure at the minimum player count is satisfied
            if len(validated_players) < MIN_PLAYERS:
                print(
                    f"You need at least {MIN_PLAYERS} players, and you entered {len(validated_players)}."
                )
                continue

            # tell the user if an entered player is not found
            for i, validated_player in enumerate(validated_players):
                if not validated_player:
                    print(f"Player {players[i]} not found.")

            # leave the while loop if all players were found
            if all(validated_players):
                game_order = validated_players

        return game_order
