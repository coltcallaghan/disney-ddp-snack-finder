# add_ids_to_partial_csv.py
# Adds unique IDs to rows missing an ID in data.csv, starting after the last numeric ID.
# Usage: python add_ids_to_partial_csv.py

import csv

input_path = 'public/data.csv'
output_path = 'public/data_with_all_ids.csv'

with open(input_path, newline='', encoding='utf-8') as infile:
    reader = list(csv.reader(infile))
    header = reader[0]
    rows = reader[1:]

# Find the index of the ID column
id_idx = header.index('ID')

# Find the last numeric ID
last_id = 0
for row in rows:
    try:
        val = int(row[id_idx].strip('"'))
        last_id = max(last_id, val)
    except Exception:
        continue

# Add IDs to rows missing them
new_rows = []
for row in rows:
    if not row[id_idx].strip():
        last_id += 1
        row[id_idx] = str(last_id)
    new_rows.append(row)

with open(output_path, 'w', newline='', encoding='utf-8') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(header)
    writer.writerows(new_rows)

print(f"Wrote CSV with all IDs to {output_path}")
