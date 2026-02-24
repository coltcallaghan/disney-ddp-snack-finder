# Disney CSV Robust Cleaner
# Usage: python3 clean_disney_csv.py
import csv

INPUT = 'public/data.csv'
OUTPUT = 'public/data_cleaned.csv'
EXPECTED_COLS = [
    'ID','ITEM','RESTAURANT','CATEGORY','DINING PLAN','LOCATION','DISNEY PARK','DESCRIPTION','PRICE','IS_DDP_SNACK'
]
EXPECTED_LEN = len(EXPECTED_COLS)

def clean_csv(input_path, output_path):
    with open(input_path, newline='', encoding='utf-8') as infile, open(output_path, 'w', newline='', encoding='utf-8') as outfile:
        reader = csv.reader(infile)
        writer = csv.writer(outfile)
        header = next(reader)
        writer.writerow(EXPECTED_COLS)
        for row in reader:
            # Pad or trim row to expected length
            if len(row) < EXPECTED_LEN:
                row += [''] * (EXPECTED_LEN - len(row))
            elif len(row) > EXPECTED_LEN:
                # Try to merge extra columns into DESCRIPTION if possible
                desc_idx = EXPECTED_COLS.index('DESCRIPTION')
                # Merge all extra columns into DESCRIPTION
                row[desc_idx] = ' '.join(row[desc_idx:len(row)-(len(row)-EXPECTED_LEN+1)+1])
                row = row[:EXPECTED_LEN]
            # Clean up boolean and price
            if row[8] in ('true', 'false'):
                row[8] = ''
            if row[9] != 'true':
                row[9] = 'false'
            writer.writerow(row)
    print(f'Cleaned CSV written to {output_path}')

if __name__ == '__main__':
    clean_csv(INPUT, OUTPUT)
