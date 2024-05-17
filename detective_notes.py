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

    def __update(self):
        # TODO
        pass
