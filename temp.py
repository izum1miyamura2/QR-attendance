import csv
import uuid

CSV_FILE = "participants.csv"

def generate_uuids():
    with open(CSV_FILE, 'r', newline='') as file:
        reader = csv.DictReader(file, delimiter='\t')
        rows = list(reader)

    for row in rows:
        if not row['UUID'].strip():
            row['UUID'] = str(uuid.uuid4())

    with open(CSV_FILE, 'w', newline='') as file:
        fieldnames = reader.fieldnames
        writer = csv.DictWriter(file, fieldnames=fieldnames, delimiter='\t')
        writer.writeheader()
        writer.writerows(rows)

if __name__ == "__main__":
    generate_uuids()
