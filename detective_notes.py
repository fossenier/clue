"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding suggestions.
"""

from config import (
    CELL_BORDER,
    CELL_SIZE,
    HAND_SIZE,
    IMAGE_PATH,
    HEADER_SIZE,
    TILE_COLOURS,
)


class DetectiveNotes(object):
    def __init__(self, suspects, weapons, rooms, players, sidebar):
        # raw game details
        self.__cards = suspects.union(weapons).union(rooms)
        self.__hand_size = HAND_SIZE[len(players)]
        self.__links = dict()
        self.__players = players
        self.__rooms = rooms
        self.__sidebar = sidebar
        self.__suspects = suspects
        self.__weapons = weapons

        # 2D dictionary to store gained card information
        # None -> no data, True -> has card, False -> does not have card
        self.__notes = {
            player: {card: None for card in self.__cards} for player in self.__players
        }

    def denied_suggestion(self, player, suggestion):
        """
        Marks when a player denies a suggestion made by the CPU player.

        str player: player who denied the suggestion.
        (str, str, str) suggestion: suggestion made by the CPU player.
        """
        for card in suggestion:
            self.__notes[player][card] = False

    def draw(self, path=IMAGE_PATH):
        from PIL import Image, ImageDraw, ImageFont

        self.__update()

        # set the width and height of the board
        width = len(self.__players) * CELL_SIZE + HEADER_SIZE
        height = len(self.__cards) * CELL_SIZE + HEADER_SIZE

        img = Image.new("RGBA", (width, height), color=(40, 39, 41))
        draw = ImageDraw.Draw(img)
        font = ImageFont.load_default()

        # draw the header
        for i, player in enumerate(self.__players):
            draw.rectangle(
                [
                    (i * CELL_SIZE + HEADER_SIZE, 0),
                    ((i + 1) * CELL_SIZE + HEADER_SIZE, HEADER_SIZE),
                ],
                fill=(255, 255, 255),
            )
            draw.text(
                (i * CELL_SIZE + HEADER_SIZE + CELL_BORDER, CELL_BORDER),
                player,
                fill=(0, 0, 0),
                font=font,
            )
        for j, card in enumerate(self.__cards):
            draw.rectangle(
                [
                    (0, j * CELL_SIZE + HEADER_SIZE),
                    (HEADER_SIZE, (j + 1) * CELL_SIZE + HEADER_SIZE),
                ],
                fill=(255, 255, 255),
            )
            draw.text(
                (CELL_BORDER, j * CELL_SIZE + HEADER_SIZE + CELL_BORDER),
                card,
                fill=(0, 0, 0),
                font=font,
            )

        # draw rows one at a time (there are always more cards than players)
        for row, card in enumerate(self.__cards):
            for col, player in enumerate(self.__players):
                # get the colour of the cell
                colour = TILE_COLOURS[self.__notes[player][card]]
                draw.rectangle(
                    [
                        (col * CELL_SIZE + HEADER_SIZE, row * CELL_SIZE + HEADER_SIZE),
                        (
                            (col + 1) * CELL_SIZE + HEADER_SIZE,
                            (row + 1) * CELL_SIZE + HEADER_SIZE,
                        ),
                    ],
                    fill=colour,
                )

        img.save(path)
        print(f"Detective notes saved to {path}.")

    def final_accusation(self):
        """
        Returns a final accusation if it is guaranteed.

        rtype (str, str, str) or None
        """
        suspect = self.__find_all_false(self.__suspects)
        weapon = self.__find_all_false(self.__weapons)
        room = self.__find_all_false(self.__rooms)

        if suspect and weapon and room:
            return suspect, weapon, room
        else:
            return None

    def make_link(self, player, suggestion):
        """
        Marks when a player has at least one card in a suggestion.
        """
        try:
            self.__links[player].append(suggestion)
        except KeyError:
            self.__links[player] = [suggestion]

    def make_suggestion(self, room):
        """
        Given the CPU player and the room they are in, returns an optimal suggestion.

        rtype (str, str, str)
        """
        # get the best suggestion
        best_suspect = self.__choose_card_suggestion(self.__suspects)
        best_weapon = self.__choose_card_suggestion(self.__weapons)

        return best_suspect, best_weapon, room

    def pick_room(self, rooms_turn_costs):
        """
        Given the possible moves the cpu can get to and the turns it'll take to get there,
        picks the best room to go to.
        """
        # sort by proximity
        soonest_reachable = dict()

        for room, turn_cost in rooms_turn_costs:
            # 0 (room being stood in) and 1 (rooms reachable this turn) are equivalent
            if turn_cost == 0:
                turn_cost = 1
            try:
                soonest_reachable[str(turn_cost)].append(room)
            except KeyError:
                soonest_reachable[str(turn_cost)] = [room]

        # select the best room
        for turn_layer in sorted(soonest_reachable.keys()):
            if self.__choose_card_suggestion(soonest_reachable[turn_layer]) is not None:
                suggestion = self.__choose_card_suggestion(
                    soonest_reachable[turn_layer]
                )
                if suggestion:
                    return suggestion

    def reveal_card(self, player, card):
        """
        Marks when a player's card is revealed.

        str player: player who revealed the card.
        str card: card that was revealed.
        """
        self.__notes[player][card] = True

    def __find_all_false(self, cards):
        """
        Returns a card that is false for all players.
        This is used when determining traits of the murderer.

        List(str) cards: list of cards to check for a false.


        rtype str or None
        """
        for card in cards:
            if self.__card_status(card) == False:
                return card

        return None

    def __card_status(self, card):
        """
        Returns the status of a card.

        True for one player having the card, False for
        no players having the card, and None for incomplete knowledge.

        rtype bool or None
        """
        all_false = True
        for player in self.__players:
            # if the card is unknown, we know it's not false for all players
            if self.__notes[player][card] is None:
                all_false = False
            elif self.__notes[player][card] is True:
                return True

        return False if all_false else None

    def __choose_card_suggestion(self, cards):
        """
        Takes in cards (suspects / weapons / rooms) and returns one which is
        the best (or simply acceptable) to suggest.
        NOTE: If all cards are known, this will return an arbitrary item.

        rtype str
        """
        acceptable_cards = []
        for card in cards:
            # if the card is all false, prefer it
            if self.__card_status(card) is False:
                return card
            # if the card is unknown, it is acceptable
            if self.__card_status(card) is None:
                acceptable_cards.append(card)
            # if a card is known, it is not an acceptable room to suggest
            else:
                continue

        if len(acceptable_cards) > 0:
            return acceptable_cards[0]
        else:
            # all cards had data on them
            return next(iter(cards))

    def __update(self):
        """
        Updates the detective notes based on the current information.
        """
        changes_made = True
        while changes_made:
            changes_made = (
                self.__deduce_hand_limit()
                or self.__deduce_known_card()
                or self.__deduce_links()
            )

    def __deduce_hand_limit(self):
        """
        Deduces information when a player's hand is full.
        They cannot have any of the remaining cards.
        """
        changes_made = False
        for player in self.__players:
            if self.__notes[player].count(True) == self.__hand_size:
                for card in self.__cards:
                    if self.__notes[player][card] is None:
                        self.__notes[player][card] = False
                        changes_made = True
        return changes_made

    def __deduce_known_card(self):
        """
        Deduces information when a card is known to be held.
        No other player can have that card.
        """
        changes_made = False
        for card in self.__cards:
            if self.__card_status(card):
                for player in self.__players:
                    if self.__notes[player][card] is None:
                        self.__notes[player][card] = False
                        changes_made = True
        return changes_made

    def __deduce_links(self):
        """
        Deduces information based on card links.
        If a player is guaranteed to have 1 of 3 cards, and 2 are known to be held
        by other players, the player must have the third card.
        """
        changes_made = False
        for player in self.__players:
            if player in self.__links:
                remaining_links = []
                for suggestion in self.__links[player]:
                    # cards known to be in OTHER players' hands
                    known_cards = []
                    # cards with unknown status
                    unknown_cards = []
                    for card in suggestion:
                        if not self.__notes[player][card] and self.__card_status(card):
                            known_cards.append(card)
                        else:
                            unknown_cards.append(card)
                    # if the player has 1 unknown card and 2 known cards
                    if len(unknown_cards) == 1 and len(known_cards) == 2:
                        # resolve the link as the player holding the third card
                        changes_made = True
                        self.__notes[player][unknown_cards[0]] = True
                    else:
                        remaining_links.append(suggestion)
                self.__links[player] = remaining_links
        return changes_made
