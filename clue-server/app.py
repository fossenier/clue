import json
from flask import Flask, jsonify
import csv
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


def read_csv(filepath):
    with open(filepath, "r") as file:
        reader = csv.reader(file)
        data = [row for row in reader]
    return data


@app.route("/api/board")
def get_board():
    data = read_csv("board.csv")
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
