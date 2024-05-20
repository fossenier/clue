"""
This is a module for the third slice of Clue.
It houses and manipulates all data regarding the board.
"""

from config import DOOR, EXPLORE_RADIUS, HALL, PASSAGE, WALL, LEFT, RIGHT, UP, DOWN
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

    def path_agent(self, player):
        """
        Given a player, returns a dictionary pairing each room in the
        game with a Node representing the shortest path to that room.

        rtype {str: Node}
        """

        def get_duplicate_states(state):
            """
            Given a state, returns all states that share the same name.

            rtype {(int, int)}
            """
            x, y = state
            tile = self.__get_tile(x, y)

            duplicate_states = set()
            for y, row in enumerate(self.__board):
                for x, t in enumerate(row):
                    if t == tile:
                        duplicate_states.add((x, y))

            return duplicate_states

        def get_actions(state):
            """
            Given a state, returns a list of possible actions.

            rtype {(int, int)}
            """
            possible_actions = set()

            x, y = state
            neighbors = [
                ((x - 1, y), LEFT),
                ((x + 1, y), RIGHT),
                ((x, y - 1), UP),
                ((x, y + 1), DOWN),
            ]
            # don't access tiles outside the board
            valid_neighbors = [
                ((nx, ny), action)
                for (nx, ny), action in neighbors
                if 0 <= nx < self.__width and 0 <= ny < self.__height
            ]

            parent_tile = self.__get_tile(x, y)
            for (nx, ny), action in valid_neighbors:
                tile = self.__get_tile(nx, ny)
                # cannot walk through walls
                if tile == WALL:
                    continue
                # can enter rooms from doors and passages
                elif tile in self.__rooms:
                    if parent_tile not in [DOOR, PASSAGE]:
                        continue
                    else:
                        possible_actions.add(action)
                # can exit rooms from doors and passages
                elif parent_tile in self.__rooms:
                    if tile not in [DOOR, PASSAGE]:
                        continue
                    else:
                        possible_actions.add(action)
                # can walk through halls
                else:
                    possible_actions.add(action)

            return possible_actions

        def transition_model(state, action):
            """
            Given a state and an action, returns the next state.

            rtype (int, int)
            """
            return (state[0] + action[0], state[1] + action[1])

        frontier = QueueFrontier()

        player_state = self.__suspect_locations[player]
        frontier.add(Node(state=player_state, parent=None, action=None))

        explored_states = set(player_state)
        pathways = dict()

        while not frontier.empty():
            current_node = frontier.remove()
            current_tile = self.__get_tile(*current_node.state)

            # when in a room, add all other instances of the room to
            # the frontier the first time it is encountered
            if current_tile in self.__rooms and current_tile not in pathways:
                duplicate_states = get_duplicate_states(current_node.state)
                for duplicate_state in duplicate_states:
                    frontier.add(
                        Node(state=duplicate_state, parent=current_node, action=None)
                    )
                    explored_states.add(duplicate_state)

            actions = get_actions(current_node.state)
            for action in actions:
                next_state = transition_model(current_node.state, action)
                if next_state in explored_states:
                    continue

                next_node = Node(state=next_state, parent=current_node, action=action)

                if next_node.state in self.__rooms:
                    room = self.__get_tile(next_node.state)
                    if room not in pathways:
                        next_node.turn_cost = current_node.turn_cost + 1
                        pathways[room] = next_node

                frontier.add(next_node)
                explored_states.add(next_node.state)
                print(
                    f"Checked from {self.__get_tile(*current_node.state)} to {self.__get_tile(*next_node.state)} via {action}"
                )

        print(pathways)

    def get_moves_2(self, player, roll):
        # TODO
        # handle the case where a player enters a room on the first turn, and can passage
        # to another room on the second turn
        """
        Gets the rooms within reach of a player this turn, and next.


        Returns a list of rooms reachable this turn (within roll) and next turn (adding EXPLORE_RADIUS).
        rtype [{str}, {str}]
        """

        def room_logic(previous_tile, new_tile, new_tile_coordinate):
            """
            Handles the room logic for taking the path between two tiles.

            Returns a room if the path entered a room, or None otherwise.
            Returns another room if there is a passage.
            rtype str, str
            """
            if previous_tile in self.__rooms:
                return previous_tile, None

            elif previous_tile == DOOR and new_tile in self.__rooms:
                # TODO make more elegant
                adjacent_coordinates = self.__get_adjacent_coordinates(
                    new_tile_coordinate
                )
                for x, y in adjacent_coordinates:
                    adjacent_tile = self.__get_tile(x, y)
                    if adjacent_tile == PASSAGE:
                        adjacent_coordinates = self.__get_adjacent_coordinates((x, y))
                        for x, y in adjacent_coordinates:
                            adjacent_tile = self.__get_tile(x, y)
                            if (
                                adjacent_tile in self.__rooms
                                and adjacent_tile != new_tile
                            ):
                                return new_tile, adjacent_tile
                return new_tile, None

            elif previous_tile == PASSAGE and new_tile in self.__rooms:
                return new_tile, None
            return None, None

        frontier = QueueFrontier()

        player_state = self.__suspect_locations[player]
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
            previous_tile = self.__get_tile(
                previous_frontier.state[0], previous_frontier.state[1]
            )
            adjacent_tile_coords = self.__get_adjacent_coordinates(
                previous_frontier.state
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

                new_tile = self.__get_tile(new_frontier.state[0], new_frontier.state[1])

                # checks if the path entered a room
                entered_room, edge_case_room = room_logic(
                    previous_tile,
                    new_tile,
                    (new_frontier.state[0], new_frontier.state[1]),
                )

                if entered_room:
                    if new_frontier.action <= roll:
                        rooms_this_turn.add(entered_room)
                    else:
                        rooms_next_turn.add(entered_room)

                # elif edge_case_room:
                #     if new_frontier.action <= roll:
                #         rooms_next_turn.add(edge_case_room)

                # the new tile is a basic traversable tile and can be explored from normally
                if new_tile in [HALL, DOOR, PASSAGE]:
                    frontier.add(new_frontier)

        return rooms_this_turn, rooms_next_turn

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
    def __get_adjacent_coordinates(self, tile_coordinate):
        """
        Gets all tile coordinates that a player could step to from a given tile's coordinate.
        Includes handling if a player is in a room. Skips walls.

        rtype {(int, int)}
        """
        x, y = tile_coordinate
        adjacent_coordinates = set()

        tile = self.__get_tile(x, y)

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
            and self.__get_tile(nx, ny) != WALL
        }

        return valid_neighbors

    def __get_duplicate_coordinates(self, tile_coordinate):
        """
        Given the coordinates of a tile, returns all coordinate
        pairs corresponding to a shared name on the board.

        rtype {(int, int)}
        """
        x, y = tile_coordinate
        tile = self.__get_tile(x, y)

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

        x_lim = (0, self.__width - 1)
        y_lim = (0, self.__height - 1)

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

                self.__width = len(self.__board[0])
                self.__height = len(self.__board)

                return
        except FileNotFoundError:
            print(f"Error: The file {board_path} does not exist.")
        except ValueError as ve:
            print(ve)

        raise ValueError("The board could not be read.")

    def __get_tile(self, x, y):
        """
        Gets a tile from the board.

        int x: x-coordinate
        int y: y-coordinate
        rtype: str
        """
        return self.__board[y][x]

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
