from pysat.solvers import Solver
from pysat.card import CardEnc

# Define possible cards as variables
cards = {
    'library': 0, 'rope': 1, 'green': 2,
    'ballroom': 3, 'knife': 4, 'plum': 5
}

# Initialize the SAT solver
solver = Solver()

# Add known constraints (for example: opponent doesn't have ballroom, knife, or plum)
solver.add_clause([-cards['ballroom'], -cards['knife'], -cards['plum']])

# Define the questions to simulate
questions = [
    ['library', 'rope', 'green'],
    ['ballroom', 'knife', 'plum']
]

# Function to simulate asking a question and checking solutions
def simulate_question(question):
    # Create a temporary solver to add the new question
    temp_solver = Solver()
    temp_solver.append_formula(solver.get_clauses())  # Copy current constraints

    # Add the new constraint for this question
    lits = [cards[q] for q in question]
    temp_solver.add_clause(lits)  # Positive case: at least one is true

    # Check how many solutions remain
    if temp_solver.solve():
        positive_count = len(temp_solver.enum_models())
    else:
        positive_count = 0

    # Now try the negative case (none of the cards are true)
    temp_solver = Solver()
    temp_solver.append_formula(solver.get_clauses())  # Reset constraints
    temp_solver.add_clause([-lit for lit in lits])  # Negative case: none are true

    # Check how many solutions remain
    if temp_solver.solve():
        negative_count = len(temp_solver.enum_models())
    else:
        negative_count = 0

    # Return the average size of the remaining solution space
    return (positive_count + negative_count) / 2

# Find the most informative question
best_question = None
smallest_space = float('inf')

for question in questions:
    avg_space = simulate_question(question)
    print(f"Question {question} leaves {avg_space} solutions on average.")

    if avg_space < smallest_space:
        smallest_space = avg_space
        best_question = question

print(f"The best question to ask is: {best_question}")