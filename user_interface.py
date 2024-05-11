"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from config import HAND_SIZE, MIN_PLAYERS
from helpers import search_within


class UI(object):
    def __init__(self):
        print("Welcome to Clue!")

    def cpu_player(self, players):
        """
        Asks the user for the CPU player.

        rtype str
        """
        cpu_player = None
        while not cpu_player:
            # get user input
            cpu_player = input("Enter the CPU player: ")
            # match input to players
            validated_cpu_player = search_within(cpu_player, players)

            # tell the user if the entered player is not found
            if not validated_cpu_player:
                print(f"Player {cpu_player} not found in {players}.")
                cpu_player = None

        return validated_cpu_player

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

    def hand(self, player, players, cards):
        """
        Asks the user for the hand of a player.

        rtype {str}
        """
        hand = None
        while not hand:
            # get user input
            hand_raw = input(f"Enter the hand of {player}: ")
            hand = {card.strip() for card in hand_raw.split(",")}
            # match input to cards
            validated_hand = {search_within(card, cards) for card in hand}

            # make sure the hand size is satisfied
            if len(validated_hand) != HAND_SIZE[len(players)]:
                print(
                    f"You need {HAND_SIZE[len(players)]} cards in a hand, and you entered {len(validated_hand)}."
                )
                hand = None
                continue

            # tell the user if an entered card is not found
            for i, validated_card in enumerate(validated_hand):
                if not validated_card:
                    print(f"Card {hand[i]} not found.")

            # leave the while loop if all cards were found
            if all(validated_hand):
                hand = validated_hand

        return hand
