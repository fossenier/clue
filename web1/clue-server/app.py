from flask import Flask, jsonify
from flask_cors import CORS
from board import Board

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


@app.route("/api/board")
def get_board():
    board = Board(board_path="board.csv")

    # Create a structured JSON response
    response = {
        "rooms": board.rooms.to_list(),  # Convert to list for JSON serialization
        "suspects": board.suspects.to_list(),  # Convert to list for JSON serialization
        "weapons": board.weapons.to_list(),  # Convert to list for JSON serialization
        "board": board.board.values.tolist(),  # Convert DataFrame to list of lists for JSON serialization
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(debug=True)
