"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from config import HAND_SIZE, MIN_PLAYERS
from helpers import search_within


class UI(object):
    def __init__(self):
        print("Welcome to Clue!")

    def get_validated_input(
        self,
        input_prompt,
        search_list,
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
            user_input = input(input_prompt)
            transformed_input = transform(user_input)
            validated_input = [
                search_within(item, search_list) for item in transformed_input
            ]

            if all(validated_input) and condition(validated_input):
                valid_input = validated_input
            else:
                print(error_message)
                if any(item is None for item in validated_input):
                    for i, item in enumerate(transformed_input):
                        if not search_within(item, search_list):
                            print(f"{item} not found in {search_list}.")
        return valid_input

    def cpu_player(self, players):
        """
        Asks the user for the CPU player.

        rtype str
        """
        return self.get_validated_input(
            "Enter the CPU player: ",
            players,
            transform=lambda x: [x.strip()],
            error_message="Player not found.",
        )[0]

    def game_order(self, suspects):
        """
        Asks the user for the order of the players in the game.

        rtype [str]
        """
        return self.get_validated_input(
            "Enter the order of the players, separated by commas: ",
            suspects,
            condition=lambda x: len(x) >= MIN_PLAYERS,
            transform=lambda x: [item.strip() for item in x.split(",")],
            error_message="Invalid game order.",
        )

    def hand(self, player, players, cards):
        """
        Asks the user for the hand of a player.

        rtype {str}
        """
        return self.get_validated_input(
            f"Enter the hand of {player}: ",
            cards,
            condition=lambda x: len(x) == HAND_SIZE[len(players)],
            transform=lambda x: {item.strip() for item in x.split(",")},
            error_message=f"Invalid hand for {player}. Must have {HAND_SIZE[len(players)]} cards.",
        )

    def sidebar(self, cards):
        """
        Asks the user for the side bar of the game.

        rtype {str}
        """
        if input("Is there a side bar in the game? (y/n): ").lower() == "n":
            return None
        return self.get_validated_input(
            "Enter the side bar of the game: ",
            cards,
            transform=lambda x: {item.strip() for item in x.split(",")},
            error_message="Invalid side bar.",
        )
