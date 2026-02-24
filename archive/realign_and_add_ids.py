# realign_and_add_ids.py
# Fixes misaligned rows in data.csv: ensures all rows have a numeric ID in the first column and columns are aligned to the header.
# Usage: python realign_and_add_ids.py

import csv

input_path = 'public/data.csv'
output_path = 'public/data_aligned_with_ids.csv'

with open(input_path, newline='', encoding='utf-8') as infile:
    reader = list(csv.reader(infile))
    header = reader[0]
    rows = reader[1:]

num_cols = len(header)
fixed_rows = []
next_id = 1

for row in rows:
    # If first column is not a number, it's a misaligned row (item name in ID col)
    try:
        int(row[0].strip('"'))
        is_aligned = True
    except Exception:
        is_aligned = False
    if not is_aligned:
        # Shift right and insert ID
        row = [str(next_id)] + row
    else:
        # Use existing ID
        row[0] = str(next_id)
    # Pad or trim row to match header
    row = (row + [''] * num_cols)[:num_cols]
    fixed_rows.append(row)
    next_id += 1

with open(output_path, 'w', newline='', encoding='utf-8') as outfile:
    writer = csv.writer(outfile)
    writer.writerow(header)
    writer.writerows(fixed_rows)

print(f"Wrote aligned CSV with IDs to {output_path}")
