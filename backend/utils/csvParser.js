// backend/utils/csvParser.js

const csv = require("csv-parser");
const { Readable } = require("stream");

/**
 * Converts a CSV file buffer into structured transaction data.
 * Your CSV must have columns like:
 *  - date
 *  - description
 *  - amount
 * 
 * Returns: data = [{ date, description, amount }]
 */
async function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    try {
      const results = [];

      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on("data", (row) => {
          results.push({
            date: row.date || row.Date || null,
            description: row.description || row.Description || "",
            amount: parseFloat(row.amount || row.Amount || 0),
          });
        })
        .on("end", () => resolve(results))
        .on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = parseCSV;