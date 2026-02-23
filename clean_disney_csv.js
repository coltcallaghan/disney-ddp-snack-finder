// Disney CSV Cleaner Script
// Run with: node clean_disney_csv.js

const fs = require('fs');
const path = './public/data.csv';
const output = './public/data_cleaned.csv';

const expectedColumns = [
  'ID','ITEM','RESTAURANT','CATEGORY','DINING PLAN','LOCATION','DISNEY PARK','DESCRIPTION','PRICE','IS_DDP_SNACK'
];

function parseCSVLine(line) {
  // Naive CSV parser for quoted fields
  const regex = /"([^"]*)"|([^,]+)/g;
  const result = [];
  let match;
  while ((match = regex.exec(line)) !== null) {
    result.push(match[1] !== undefined ? match[1] : match[2]);
  }
  return result;
}

function cleanCSV(inputPath, outputPath) {
  const lines = fs.readFileSync(inputPath, 'utf8').split(/\r?\n/);
  const header = lines[0];
  const cleaned = [header];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const fields = parseCSVLine(line);
    if (fields.length !== expectedColumns.length) {
      // Try to fix: pad or trim
      if (fields.length < expectedColumns.length) {
        while (fields.length < expectedColumns.length) fields.push('');
      } else {
        fields.length = expectedColumns.length;
      }
    }
    // Remove 'true'/'false' in price, fix boolean
    if (fields[8] === 'true' || fields[8] === 'false') fields[8] = '';
    if (fields[9] !== 'true') fields[9] = 'false';
    cleaned.push(fields.map(f => f.includes(',') ? '"' + f + '"' : f).join(','));
  }
  fs.writeFileSync(outputPath, cleaned.join('\n'), 'utf8');
  console.log('Cleaned CSV written to', outputPath);
}

cleanCSV(path, output);
