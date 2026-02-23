// fix_csv_ids_original.cjs
// Usage: node fix_csv_ids_original.cjs
// This script reads public/data.csv, ensures every row has a unique numeric ID, and writes to public/data_with_ids.csv

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const inputPath = path.join(__dirname, 'public', 'data.csv');
const outputPath = path.join(__dirname, 'public', 'data_with_ids.csv');

const csvText = fs.readFileSync(inputPath, 'utf8');
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

const rows = parsed.data;

// Assign unique numeric IDs starting from 1
if (typeof rows.forEach === 'function') {
  rows.forEach((row, idx) => {
    row.ID = (idx + 1).toString();
  });
}

const csvOut = Papa.unparse(rows);
fs.writeFileSync(outputPath, csvOut, 'utf8');

console.log(`Wrote cleaned CSV with IDs to ${outputPath}`);
