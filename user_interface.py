"""
This is the inferface for a third slice of Clue.
It handles all communication between the program and the user.
"""

from config import HAND_SIZE, MIN_PLAYERS, Suggestion
from helpers import search_within
from typing import Dict, List


class UI(object):
    def __init__(self, user_commands: Dict[str, callable]):
        self.__USER_COMMANDS = user_commands
        print("Welcome to Clue!")

    # public methods
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

    def cpu_suggestion(
        self, cpu_player: str, player_order: List[str], suggestion: Suggestion
    ) -> Dict[str, str]:
        """
        Handles a cpu suggestion being made, and prompts the user for the revealed
        card.

        Returns a mapping between players and either the card they showed or None.
        """
        print(f"{cpu_player} made the suggestion: {suggestion}")

        player_response = suggestion(cpu_player, player_order, suggestion)
        player_card = dict()

        for player in player_response:
            if player_response[player]:
                card = self.__get_validated_input(
                    input_prompt=f"Which card did {player} show? ",
                    search_list=suggestion.cards,
                    transform=lambda x: x.lower(),
                    error_message=f"Invalid card, must be within {suggestion.cards}.",
                )[0]
                player_card[player] = card
            else:
                player_card[player] = None

        return player_card

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
            preserve_order=True,
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

    def human_suggestion(
        self,
        human_player: str,
        player_order: List[str],
        suspects: List[str],
        weapons: List[str],
        rooms: List[str],
    ) -> Dict[str, bool]:
        """
        Handles a human suggestion being made, and prompts the user for which player
        showed a card.

        Returns a mapping between players and either True or False.
        Or None if the human player did not make a suggestion.
        """
        # no suggestion is made
        if (
            self.__get_validated_input(
                input_prompt=f"Does {human_player} make a suggestion? (yes/no): ",
                search_list=["yes", "no"],
                condition=lambda x: len(x) == 1,
                transform=lambda x: x.lower(),
                error_message="Invalid response.",
            )[0]
            == "no"
        ):
            return None

        print("Choose what was suggested.")

        suspect, weapon, room = None, None, None
        suggestion_cards = [suspect, weapon, room]
        for i, card_type in enumerate([suspects, weapons, rooms]):
            suggestion_cards[i] = self.__get_validated_input(
                input_prompt=f"{card_type}: ",
                search_list=card_type,
                condition=lambda x: len(x) == 1,
                transform=lambda x: x.lower(),
                error_message=f"Invalid input, must select from the list.",
            )[0]

        suggestion = Suggestion(*suggestion_cards)

        return self.__suggestion(human_player, player_order, suggestion)

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

    def sidebar(self, cards, cpu_hand, sidebar_size):
        """
        Asks the user for the side bar of the game.

        rtype {str}
        """
        # TODO ensrue cards in the sidebar are not in the CPU hand
        if sidebar_size == 0:
            return None
        # the cards must be in `cards` and not in `cpu_hand` and must be `len(sidebar_size)`
        return self.__get_validated_input(
            input_prompt="Enter the cards in the sidebar: ",
            search_list=cards,
            condition=lambda x: lambda x: len(x) == sidebar_size
            and not any(card in cpu_hand for card in x),
            transform=lambda x: {item.strip() for item in x.split(",")},
            error_message=f"Invalid side bar. Must be {sidebar_size} cards. And not in the CPU hand.",
        )

    # private methods
    def __get_validated_input(
        self,
        input_prompt="No prompt provided.",
        search_list=[],
        condition=lambda x: True,
        transform=lambda x: x,
        error_message="",
        preserve_order=False,
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
            if preserve_order:
                validated_input = [
                    search_within(item, search_list) for item in transformed_input
                ]
            else:
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

    def __suggestion(
        self,
        originating_player: str,
        player_order: List[str],
        suggestion: Suggestion,
    ) -> List[Suggestion, Dict[str, bool]]:
        """
        Prompts the user for the responses to a suggestion being made as it is passed
        around the turn order.

        Returns a tuple containing the suggestion and a mapping between players
        and their responses (True / False).
        """
        print(f"{originating_player} made the suggestion: {suggestion}")

        # locate where to start circling from
        start_index = player_order.index(originating_player) + 1
        # shift the list to start from the player after the originating player
        shifted_order = player_order[start_index:] + player_order[:start_index]

        # mapping between players and their responses
        player_response = dict()

        for player in shifted_order:
            if player == originating_player:
                # the suggestion went full circle
                break

            # the player had no cards to show
            if (
                self.__get_validated_input(
                    input_prompt=f"Did {player} show a card? (yes/no): ",
                    search_list=["yes", "no"],
                    transform=lambda x: x.lower(),
                    error_message="Invalid response.",
                )[0]
                == "no"
            ):
                player_response[player] = False
            # the player had a card to show
            else:
                player_response[player] = True

        return suggestion, player_response
