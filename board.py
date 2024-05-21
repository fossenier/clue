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
        player_node = Node(state=player_state, parent=None, action=None)
        frontier.add(player_node)

        explored_states = set()
        pathways = dict()

        # the first tile has to be checked to see if it is a room
        if self.__get_tile(*player_state) in self.__rooms:
            pathways[self.__get_tile(*player_state)] = player_node

        while not frontier.empty():
            current_node = frontier.remove()
            current_tile = self.__get_tile(*current_node.state)

            # when in a room, add all other instances of the room to
            # the frontier the first time it is encountered
            if (
                current_tile in self.__rooms
                and current_node.state not in explored_states
            ):
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

                next_tile = self.__get_tile(*next_node.state)
                if next_tile in self.__rooms:
                    # entering a room costs a turn
                    next_node.turn_cost = current_node.turn_cost + 1
                    if next_tile not in pathways:
                        pathways[next_tile] = next_node

                frontier.add(next_node)
                explored_states.add(next_node.state)
                # TODO remove
                print(
                    f"Checked from {self.__get_tile(*current_node.state)} at {current_node.state} to {self.__get_tile(*next_node.state)} at {next_node.state} via {action}"
                )

        return pathways

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
