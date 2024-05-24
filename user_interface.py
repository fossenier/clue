"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from config import HAND_SIZE, MIN_PLAYERS
from helpers import search_within
from typing import Dict


class UI(object):
    def __init__(self, user_commands: Dict[str, callable]):
        self.__USER_COMMANDS = user_commands
        print("Welcome to Clue!")

    def __get_validated_input(
        self,
        input_prompt="No prompt provided.",
        search_list=[],
        condition=lambda x: True,
        transform=lambda x: x,
        error_message="",
    ):
        """
        General method to get validated input from the user.

        input_prompt: str - The message to show when asking for input.
        search_list: list - The list against which to validate the input.
        condition: function - A function to evaluate additional conditions.
        transform: function - A function to transform input before validation.
        error_message: str - Error message to display when conditions are not met.
        """
        valid_input = None
        while not valid_input:
            user_input = self.command_enabled_input(input_prompt)
            transformed_input = transform(user_input)
            # turn the input into a set to remove duplicates
            validated_input = set(
                [search_within(item, search_list) for item in transformed_input]
            )

            if all(validated_input) and condition(validated_input):
                # turn the input back into a list
                valid_input = list(validated_input)
            else:
                print(error_message)
                if any(item is None for item in validated_input):
                    for i, item in enumerate(transformed_input):
                        if not search_within(item, search_list):
                            print(f"{item} not found in {search_list}.")
        return valid_input

    def command_enabled_input(self, message):
        """
        Acts like input() but will handle commands.
        """
        user_input = None
        while not user_input:
            user_input = input(message)

            if user_input in self.__USER_COMMANDS.keys():
                self.__USER_COMMANDS[user_input]()
                print(f"Executed command: {self.__USER_COMMANDS[user_input].__name__}")
                user_input = None

        return user_input

    def cpu_player(self, players):
        """
        Asks the user for the CPU player.

        rtype str
        """
        return self.__get_validated_input(
            input_prompt="Enter the CPU player: ",
            search_list=players,
            transform=lambda x: [x.strip()],
            error_message="Player not found.",
        )[0]

    def final_accusation(self, player, accusation):
        """
        Tells the user the final accusation of the CPU player.

        rtype (str, str, str)
        """
        print(f"{player} made the final accusation: {accusation}")

    def game_order(self, suspects):
        """
        Asks the user for the order of the players in the game.

        rtype [str]
        """
        return self.__get_validated_input(
            input_prompt="Enter the order of the players, separated by commas: ",
            search_list=suspects,
            condition=lambda x: len(x) >= MIN_PLAYERS,
            transform=lambda x: [item.strip() for item in x.split(",")],
            error_message="Invalid game order.",
        )

    def hand(self, player, players, cards):
        """
        Asks the user for the hand of a player.

        rtype {str}
        """
        return self.__get_validated_input(
            input_prompt=f"Enter the hand of {player} ({HAND_SIZE[len(players)]} cards): ",
            search_list=cards,
            condition=lambda x: len(x) == HAND_SIZE[len(players)],
            transform=lambda x: {item.strip() for item in x.split(",")},
            error_message=f"Invalid hand for {player}. Must have {HAND_SIZE[len(players)]} cards.",
        )

    def roll(self, player):
        """
        Asks the user for the roll of the dice.

        rtype int
        """
        return self.__get_validated_input(
            input_prompt=f"Enter the roll for {player}: ",
            search_list=list(range(2, 13)),
            transform=lambda x: [int(x)],
            error_message="Invalid roll, must be 2-12.",
        )[0]

    def sidebar(self, cards):
        # TODO make it so that cards in the sidebar cannot be in the cpu hand
        """
        Asks the user for the side bar of the game.

        rtype {str}
        """
        if input("Is there a side bar in the game? (y/n): ").lower() == "n":
            return None
        return self.__get_validated_input(
            input_prompt="Enter the side bar of the game: ",
            search_list=cards,
            transform=lambda x: {item.strip() for item in x.split(",")},
            error_message="Invalid side bar.",
        )

    def suggestion(self, cpu_player, suggestion, player_order):
        """
        Tells the user the suggestion made by the CPU player.
        Then prompts for which players showed a card.

        Returns a dictionary of players and their responses (a card or None).
        rtype {str: str}
        """
        print(f"{cpu_player} made the suggestion: {suggestion}")

        # find the index of the cpu_player
        start_index = player_order.index(cpu_player) + 1

        # rotate the list to start from the player after cpu_player
        rotated_order = player_order[start_index:] + player_order[:start_index]
        player_response = list()

        for player in rotated_order:
            if player == cpu_player:
                return None

            showed_a_card = self.__get_validated_input(
                input_prompt=f"Did {player} show a card? (yes/no): ",
                search_list=["yes", "no"],
                transform=lambda x: x.lower(),
                error_message="Invalid response.",
            )
            if showed_a_card:
                card = self.__get_validated_input(
                    input_prompt=f"Which card did {player} show? ",
                    search_list=suggestion,
                    transform=lambda x: x.lower(),
                    error_message="Invalid card.",
                )
                player_response.append(player, card)
                # nobody else reveals cards after one player does
                break
            else:
                player_response.append(player, None)
            return player_response
