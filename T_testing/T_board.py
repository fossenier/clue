"""
Test suites for helpers.py
"""

import sys
import os

current_dir = os.path.dirname(__file__)
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)


from board import Board
from testing_utilities import assertion_list_content_equality

# initialize the board
board_obj = Board("board_1.csv")

expected_suspects = [
    "Mustard",
    "Plum",
    "Green",
    "Peacock",
    "Scarlett",
    "White",
]
expected_weapons = [
    "Candlestick",
    "Knife",
    "Lead Pipe",
    "Revolver",
    "Rope",
    "Wrench",
]
expected_rooms = [
    "Kitchen",
    "Ballroom",
    "Conserve",
    "Dining",
    "Lounge",
    "Hall",
    "Study",
    "Library",
    "Billiard",
]

if not assertion_list_content_equality(list(board_obj.suspects()), expected_suspects):
    print(
        f"FAIL   |   Potential error in case: `Board suspects() does not return expected suspects`   |   Ran: board_obj.suspects()   Parameters: None   Expected: {expected_suspects}   Actual: {board_obj.suspects()} "
    )
if not assertion_list_content_equality(list(board_obj.weapons()), expected_weapons):
    print(
        f"FAIL   |   Potential error in case: `Board weapons() does not return expected weapons`   |   Ran: board_obj.weapons()   Parameters: None   Expected: {expected_weapons}   Actual: {board_obj.weapons()} "
    )
if not assertion_list_content_equality(list(board_obj.rooms()), expected_rooms):
    print(
        f"FAIL   |   Potential error in case: `Board rooms() does not return expected rooms`   |   Ran: board_obj.rooms()   Parameters: None   Expected: {expected_rooms}   Actual: {board_obj.rooms()} "
    )

expected_cards = [
    "Mustard",
    "Plum",
    "Green",
    "Peacock",
    "Scarlett",
    "White",
    "Candlestick",
    "Knife",
    "Lead Pipe",
    "Revolver",
    "Rope",
    "Wrench",
    "Kitchen",
    "Ballroom",
    "Conserve",
    "Dining",
    "Lounge",
    "Hall",
    "Study",
    "Library",
    "Billiard",
]

if not assertion_list_content_equality(list(board_obj.cards()), expected_cards):
    print(
        f"FAIL   |   Potential error in case: `Board cards() does not return expected cards`   |   Ran: board_obj.cards()   Parameters: None   Expected: {expected_cards}   Actual: {board_obj.cards()} "
    )
