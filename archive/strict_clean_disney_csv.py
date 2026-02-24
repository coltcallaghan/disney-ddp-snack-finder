# Disney CSV strict cleaner: ensures price is always a price, description is never a price, and all columns are quoted if needed.
# Usage: python3 strict_clean_disney_csv.py
import csv
import re

INPUT = 'public/data_cleaned_noplan.csv'
OUTPUT = 'public/data_cleaned_strict.csv'
EXPECTED_COLS = [
    'ID','ITEM','RESTAURANT','CATEGORY','LOCATION','DISNEY PARK','DESCRIPTION','PRICE','IS_DDP_SNACK'
]
EXPECTED_LEN = len(EXPECTED_COLS)

PRICE_PATTERN = re.compile(r'^\$?\d+(\.\d{1,2})?$')

with open(INPUT, newline='', encoding='utf-8') as infile, open(OUTPUT, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile, quoting=csv.QUOTE_MINIMAL)
    header = next(reader)
    writer.writerow(EXPECTED_COLS)
    for row in reader:
        # Pad or trim row
        if len(row) < EXPECTED_LEN:
            row += [''] * (EXPECTED_LEN - len(row))
        elif len(row) > EXPECTED_LEN:
            row = row[:EXPECTED_LEN]
        # Fix description/price mixup
        desc = row[6].strip()
        price = row[7].strip()
        # If description is a price, move to price column
        if PRICE_PATTERN.match(desc):
            if not price:
                price = desc
            desc = ''
        # If price is not a price, move to description
        if price and not PRICE_PATTERN.match(price):
            if desc:
                desc = desc + ' ' + price
            else:
                desc = price
            price = ''
        # Always quote fields with commas or newlines
        row = [desc if i == 6 else price if i == 7 else row[i] for i in range(EXPECTED_LEN)]
        writer.writerow([
            f'"{v}"' if (',' in v or '\n' in v or '"' in v) else v for v in row
        ])
print(f'Strict cleaned CSV written to {OUTPUT}')
