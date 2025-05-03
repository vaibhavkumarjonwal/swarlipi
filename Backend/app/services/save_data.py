import json
import os

# Save rows to a JSON file
def save_rows_to_file(rows, filename):
    with open(f'{filename}.json', 'w') as file:
        json.dump(rows, file, indent=4)  # Pretty print for better readability

# Load rows from the JSON file
def load_rows_from_file(filename):
    file_path = f'{filename}.json'
    if os.path.exists(file_path):
        try:
            with open(file_path, 'r') as file:
                return json.load(file)
        except json.JSONDecodeError:
            print(f"Error: Could not decode JSON from {file_path}")
            return {}
    return {}
