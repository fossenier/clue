"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding the board.
"""

from config import DOOR, EXPLORE_RADIUS, HALL, PASSAGE, WALL
from helpers import Node, QueueFrontier


class Board(object):
    def __init__(self, board_path):
        """
        Initializes a Clue board.

        Raises a ValueError if the board_path has issues.

        str board_path: path to Clue board .csv file.
        """
        # game state
        self.__board = None
        # game details
        self.__rooms = None
        self.__suspects = None
        self.__weapons = None

        self.__suspect_locations = {}

        # populate game state and details
        self.__populate_board_weapons(board_path)
        self.__populate_suspects_rooms()
        self.__populate_suspect_locations()

        self.__width = len(self.__board[0])
        self.__height = len(self.__board)

    # public methods
    def cards(self):
        """
        Gets a set of all the game's cards (suspects, weapons, rooms).

        rtype {str}
        """
        return self.__suspects.copy().union(
            self.__weapons.copy().union(self.__rooms.copy())
        )

    def get_moves(self, cpu_player, roll):
        """
        Gets the possible rooms the cpu can move to.
        The first list is rooms reachable this turn.
        The second list is rooms reachable in the next turn (assuming a roll of 7).

        rtype [{str}, {str}]
        """
        frontier = QueueFrontier()
        # put the cpu's location in the frontier to begin exploring
        print(f"{cpu_player} is at {self.__suspect_locations[cpu_player]}")
        frontier.add(
            Node(state=self.__suspect_locations[cpu_player], parent=None, action=0)
        )

        explored_states = set()
        reachable_rooms = set()
        reachable_rooms_next_turn = set()

        while not frontier.empty():
            position = frontier.remove()
            # steps taken to reach the current tile
            steps = 0 if not position.parent else position.parent.action
            # stop exploring if taking one more step would exceed (the roll) + (expected roll next turn)
            if (steps + 1) > (roll + EXPLORE_RADIUS):
                break
            # all tiles adjacent to the current tile
            adjacent_tiles = self.__get_neighbors(position.state)

            for x, y in adjacent_tiles:
                new_position = Node(state=(x, y), parent=position, action=steps + 1)
                if new_position.state not in explored_states:
                    explored_states.add(new_position.state)

                    new_tile = self.__board[new_position.state[1]][
                        new_position.state[0]
                    ]
                    if new_position.parent:
                        initial_tile = self.__board[new_position.parent.state[1]][
                            new_position.parent.state[0]
                        ]

                        if new_tile in self.__rooms:
                            if new_position.action <= roll:
                                reachable_rooms.add(new_tile)
                            else:
                                reachable_rooms_next_turn.add(new_tile)

                        if initial_tile == DOOR and new_tile in self.__rooms:
                            if new_position.action <= roll:
                                reachable_rooms.add(new_tile)
                            else:
                                reachable_rooms_next_turn.add(new_tile)

                        elif initial_tile == PASSAGE and new_tile in self.__rooms:
                            if new_position.action <= roll:
                                reachable_rooms.add(new_tile)
                            else:
                                reachable_rooms_next_turn.add(new_tile)

                    if new_tile == WALL:
                        continue
                    elif new_tile in [DOOR, HALL, PASSAGE]:
                        # this is a regular tile that can be traversed
                        frontier.add(new_position)
                else:
                    # do not explore tiles twice
                    pass

        return reachable_rooms, reachable_rooms_next_turn

    def rooms(self):
        """
        Gets a set of all the game's rooms.

        rtype {str}
        """
        return self.__rooms.copy()

    def suspects(self):
        """
        Gets a set of all the game's suspects.

        rtype {str}
        """
        return self.__suspects.copy()

    def weapons(self):
        """
        Gets a set of all the game's weapons.

        rtype {str}
        """
        return self.__weapons.copy()

    # private methods
    def __get_neighbors(self, location):
        """
        Gets the neighbors of a location.

        rtype [(int, int)]
        """
        x, y = location
        potential_neighbors = [
            (x - 1, y),
            (x + 1, y),
            (x, y - 1),
            (x, y + 1),
        ]
        valid_neighbors = [
            (nx, ny)
            for nx, ny in potential_neighbors
            if 0 <= nx < self.__width and 0 <= ny < self.__height
        ]
        return valid_neighbors

    def __get_tile_coords(self, tile):
        """
        Gets the coordinates of a tile. (x, y).
        Returns a list of coordinates if the tile appears in multiple places.

        rtype [(int, int)]
        """
        positions = []
        for y, row in enumerate(self.__board):
            for x, t in enumerate(row):
                if t == tile:
                    positions.append((x, y))
        return positions

    def __populate_suspect_locations(self):
        """
        Accesses the board and determines the locations of the suspects.

        Modifies self.board (removes suspect tiles)

        Populates self.suspect_locations.
        """
        for y, row in enumerate(self.__board):
            for x, tile in enumerate(row):
                if tile in self.__suspects:
                    self.__suspect_locations[tile] = (x, y)
                    self.__set_tile(x, y, HALL)

    def __populate_suspects_rooms(self):
        """
        Accesses the board and determines the rooms and suspects.

        Populates self.rooms and self.suspects.
        """
        # non room and suspect tiles
        basic_tiles = {DOOR, HALL, PASSAGE, WALL}

        self.__rooms = set()
        self.__suspects = set()

        x_lim = (0, len(self.__board[0]) - 1)
        y_lim = (0, len(self.__board) - 1)

        for y, row in enumerate(self.__board):
            for x, tile in enumerate(row):
                # check if tile is a room or suspect
                if tile not in basic_tiles:
                    # suspects are on the edge of the board
                    if x in x_lim or y in y_lim:
                        self.__suspects.add(tile)
                    else:
                        self.__rooms.add(tile)

        # don't allow ""
        self.__rooms.discard("")
        self.__suspects.discard("")

    def __populate_board_weapons(self, board_path):
        """
        Reads a Clue board from a .csv file.

        Populates self.board and self.weapons.

        Raises a ValueError if the board_path has issues.

        str board_path: path to Clue board .csv file
        """
        try:
            with open(board_path, "r") as f:
                # read weapons from first row
                self.__weapons = set(f.readline().strip().split(","))
                # read board from remaining rows
                board = [line.strip().split(",") for line in f]
                if not board:  # check if the board is empty
                    raise ValueError("The CSV file is empty.")
                self.__board = board
                return
        except FileNotFoundError:
            print(f"Error: The file {board_path} does not exist.")
        except ValueError as ve:
            print(ve)

        raise ValueError("The board could not be read.")

    def __set_tile(self, x, y, tile):
        """
        Sets a tile on the board.

        int x: x-coordinate
        int y: y-coordinate
        str tile: tile to set
        """
        self.__board[y][x] = tile

    # python special methods
    def __str__(self):
        """
        Returns a string representation of the board.

        rtype: str
        """
        return "\n".join([",".join(row) for row in self.__board])
