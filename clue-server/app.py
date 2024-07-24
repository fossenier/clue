import json
from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def read_csv(filepath):
    with open(filepath, "r") as file:
        data = file.readlines()
    return [line.strip().split(",") for line in data]


def extract_data(data):
    rooms, suspects, weapons, board = [], [], [], []
    for row in data:
        if row[0] == "rooms":
            rooms = row[1:]
        elif row[0] == "suspects":
            suspects = row[1:]
        elif row[0] == "weapons":
            weapons = row[1:]
        else:
            board.append(row)

    return rooms, suspects, weapons, board


@app.route("/api/board")
def get_board():
    data = read_csv("board.csv")
    rooms, suspects, weapons, board = extract_data(data)

    # Create a structured JSON response
    response = {
        "rooms": rooms,
        "suspects": suspects,
        "weapons": weapons,
        "board": board,
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
