"""
This is a module for the third slice of Clue.
It houses all magic numbers and config values.
"""

# multiple
HAND_SIZE = {3: 6, 4: 4, 5: 3, 6: 3}

# board.py
BOARD_IMG_PATH = "board.png"
TILE_SIZE = 50
TILE_BORDER = 5

BOARD = "board"
BOARD_PATH = "/Users/admin/projects/monorepo/clue/board.csv"
DOOR = "Door"
EXPLORE_RADIUS = 7
HALL = " "
PASSAGE = "Passage"
WALL = "x"

LEFT = (-1, 0)
RIGHT = (1, 0)
UP = (0, -1)
DOWN = (0, 1)

# detective_notes.py
CELL_BORDER = 5
CELL_SIZE = 60
HEADER_SIZE = 120
IMAGE_PATH = "detective_notes.png"
TILE_COLOURS = {
    True: (211, 174, 141),  # light brown for True
    False: (244, 91, 96),  # soft red for False
    None: (238, 228, 210),  # light cream for Unknown
}

# user_interface.py
MIN_PLAYERS = 3
