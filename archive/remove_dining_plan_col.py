# Remove DINING PLAN column from cleaned Disney CSV
# Usage: python3 remove_dining_plan_col.py
import csv

INPUT = 'public/data_cleaned.csv'
OUTPUT = 'public/data_cleaned_noplan.csv'
REMOVE_COL = 'DINING PLAN'

with open(INPUT, newline='', encoding='utf-8') as infile, open(OUTPUT, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile)
    header = next(reader)
    if REMOVE_COL not in header:
        raise Exception(f'Column {REMOVE_COL} not found in header!')
    idx = header.index(REMOVE_COL)
    new_header = header[:idx] + header[idx+1:]
    writer.writerow(new_header)
    for row in reader:
        if len(row) > idx:
            new_row = row[:idx] + row[idx+1:]
        else:
            new_row = row
        writer.writerow(new_row)
print(f'Removed {REMOVE_COL} column. Output: {OUTPUT}')
