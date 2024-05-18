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

        self.__suspect_locations = dict()

        # populate game state and details
        self.__populate_board_weapons(board_path)
        self.__populate_suspects_rooms()
        self.__populate_suspect_locations()

        self.__width = len(self.__board[0])
        self.__height = len(self.__board)

        # TODO remove me
        self.__suspect_locations["Scarlett"] = (6, 11)

    # public methods
    def cards(self):
        """
        Gets a set of all the game's cards (suspects, weapons, rooms).

        rtype {str}
        """
        return self.__suspects.copy().union(
            self.__weapons.copy().union(self.__rooms.copy())
        )

    def get_moves_2(self, player, roll, position=None):
        # TODO
        # handle the case where a player enters a room on the first turn, and can passage
        # to another room on the second turn
        """
        Gets the rooms within reach of a player this turn, and next.


        Returns a list of rooms reachable this turn (within roll) and next turn (adding EXPLORE_RADIUS).
        rtype [{str}, {str}]
        """

        def room_logic(previous_tile, new_tile):
            """
            Handles the room logic for taking the path between two tiles.

            Returns a room if the path entered a room, or None otherwise.
            rtype str
            """
            if previous_tile in self.__rooms:
                return previous_tile
            elif previous_tile == DOOR and new_tile in self.__rooms:
                return new_tile
            elif previous_tile == PASSAGE and new_tile in self.__rooms:
                return new_tile
            return None

        frontier = QueueFrontier()

        player_state = position if position else self.__suspect_locations[player]
        frontier.add(Node(state=player_state, parent=None, action=0))

        # tracks pathways between two tiles
        # ' ' -> 'Lounge' has a different effect than 'Door' -> 'Lounge'
        explored_paths = set((None, player_state))
        rooms_this_turn = set()
        rooms_next_turn = set()

        while not frontier.empty():
            previous_frontier = frontier.remove()

            # do not explore tiles assumed to only be reachable three turns away
            if previous_frontier.action > roll + EXPLORE_RADIUS:
                break

            # tile to step from and tile coordinates adjacent to this tile
            previous_tile = self.__board[previous_frontier.state[1]][
                previous_frontier.state[0]
            ]
            adjacent_tile_coords = self.__get_adjacent_coordinates(
                self.__board, previous_frontier.state
            )

            for x, y in adjacent_tile_coords:
                new_frontier = Node(
                    state=(x, y),
                    parent=previous_frontier,
                    action=previous_frontier.action + 1,
                )

                # do not explore paths twice
                if (
                    new_frontier.parent.state,
                    new_frontier.state,
                ) not in explored_paths:
                    explored_paths.add((new_frontier.parent.state, new_frontier.state))
                else:
                    continue

                new_tile = self.__board[new_frontier.state[1]][new_frontier.state[0]]

                # checks if the path entered a room
                entered_room = room_logic(previous_tile, new_tile)
                if entered_room:
                    if new_frontier.action <= roll:
                        rooms_this_turn.add(entered_room)
                    else:
                        rooms_next_turn.add(entered_room)

                # the new tile is a basic traversable tile and can be explored from normally
                if new_tile in [HALL, DOOR, PASSAGE]:
                    frontier.add(new_frontier)

        return rooms_this_turn, rooms_next_turn

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

        explored_states = set((None, self.__suspect_locations[cpu_player]))
        reachable_rooms = set()
        reachable_rooms_next_turn = set()

        while not frontier.empty():
            position = frontier.remove()
            # steps taken to reach the current tile
            steps = position.action
            # stop exploring if taking one more step would exceed (the roll) + (expected roll next turn)
            if (steps + 1) > (roll + EXPLORE_RADIUS):
                break
            # all tiles adjacent to the current tile
            adjacent_tiles = list()
            the_tile = self.__board[position.state[1]][position.state[0]]
            if the_tile in self.__rooms:
                starter_tiles = self.__get_duplicate_coordinates(position.state)
                for starter_tile in starter_tiles:
                    adjacent_tiles.extend(self.__get_neighbors(starter_tile))
            else:
                adjacent_tiles.extend(self.__get_neighbors(position.state))

            for x, y in adjacent_tiles:
                new_position = Node(state=(x, y), parent=position, action=steps + 1)
                if (
                    new_position.parent.state,
                    new_position.state,
                ) not in explored_states:
                    explored_states.add((new_position.parent.state, new_position.state))

                    new_tile = self.__board[new_position.state[1]][
                        new_position.state[0]
                    ]
                    if new_position.parent:
                        initial_tile = self.__board[new_position.parent.state[1]][
                            new_position.parent.state[0]
                        ]

                        # started in a room and thus can move to it (no actions)
                        if initial_tile in self.__rooms:
                            if new_position.action <= roll:
                                reachable_rooms.add(initial_tile)
                            else:
                                reachable_rooms_next_turn.add(initial_tile)

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
                        # if the cpu is in a room, it can move to a passage
                        elif initial_tile in self.__rooms and new_tile == PASSAGE:
                            frontier.add(new_position)
                        # no stepping out of passages allowed
                        elif initial_tile == PASSAGE and new_tile not in self.__rooms:
                            continue

                    if new_tile == WALL:
                        continue
                    elif new_tile in [DOOR, HALL]:
                        # this is a regular tile that can be traversed
                        frontier.add(new_position)
                else:
                    # do not explore tiles twice
                    pass

        # no need to know that the rooms reachable this turn are reachable next
        reachable_rooms_next_turn.difference_update(reachable_rooms)
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
    def __get_adjacent_coordinates(self, board, tile_coordinate):
        """
        Gets all tile coordinates that a player could step to from a given tile's coordinate.
        Includes handling if a player is in a room. Skips walls.

        rtype {(int, int)}
        """
        x, y = tile_coordinate
        adjacent_coordinates = set()

        tile = board[y][x]

        # rooms can be exited from numerous locations
        if tile in self.__rooms:
            duplicate_coordinates = self.__get_duplicate_coordinates((x, y))
            for duplicate_coordinate in duplicate_coordinates:
                adjacent_coordinates.update(self.__get_neighbors(duplicate_coordinate))
        else:
            adjacent_coordinates.update(self.__get_neighbors(tile_coordinate))

        return adjacent_coordinates

    def __get_neighbors(self, tile_coordinate):
        """
        Gets the neighboring walkable tiles surrounding a location. Skips walls.

        rtype {(int, int)}
        """
        x, y = tile_coordinate
        potential_neighbors = [
            (x - 1, y),
            (x + 1, y),
            (x, y - 1),
            (x, y + 1),
        ]
        # don't access tiles outside the board or return walls
        valid_neighbors = {
            (nx, ny)
            for nx, ny in potential_neighbors
            if 0 <= nx < self.__width
            and 0 <= ny < self.__height
            and self.__board[ny][nx] != WALL
        }

        return valid_neighbors

    def __get_duplicate_coordinates(self, tile_coordinate):
        """
        Given the coordinates of a tile, returns all coordinate
        pairs corresponding to a shared name on the board.

        rtype {(int, int)}
        """
        x, y = tile_coordinate
        tile = self.__board[y][x]

        duplicate_coordinates = set()
        for y, row in enumerate(self.__board):
            for x, t in enumerate(row):
                if t == tile:
                    duplicate_coordinates.add((x, y))

        return duplicate_coordinates

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
