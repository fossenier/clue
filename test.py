import pandas as pd

df = pd.read_csv("board.csv", skiprows=3, header=None)

print(df)
