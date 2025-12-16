// utils/pdfParser.js
// ---------------------------------------------------
// Unified PDF + CSV parser for bank statement uploads
// ---------------------------------------------------

const pdfParse = require("pdf-parse");

/**
 * Extract usable text from uploaded files (PDF or CSV).
 * Cleans formatting and returns only meaningful lines.
 */
async function extractStatementText(file) {
  const { buffer, mimetype, originalname } = file;

  let rawText = "";
  const lower = originalname.toLowerCase();

  try {
    // ----- PDF -----
    if (mimetype === "application/pdf" || lower.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || "";
    }

    // ----- CSV or TXT -----
    else if (
      mimetype === "text/csv" ||
      mimetype === "text/plain" ||
      lower.endsWith(".csv") ||
      lower.endsWith(".txt")
    ) {
      rawText = buffer.toString("utf8");
    }

    // ----- Fallback -----
    else {
      rawText = buffer.toString("utf8");
    }
  } catch (err) {
    console.error("❌ Error extracting text:", err);
    throw new Error("Could not parse this file. Try another export type.");
  }

  if (!rawText || rawText.trim().length < 10) {
    throw new Error("File contained too little readable text.");
  }

  // Normalize spacing
  let cleaned = rawText
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  const lines = cleaned
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  // Detect transaction-like lines
  const transactionLines = lines.filter(line => {
    const hasDate =
      /\b(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(
        line
      );

    const hasMoney =
      /[$€£]?\s?-?\d{1,4}(?:,\d{3})*(\.\d{2})/.test(line);

    return (hasDate && line.length > 15) || hasMoney;
  });

  // If we found enough transaction rows → prioritize them
  if (transactionLines.length >= 5) {
    return transactionLines.join("\n");
  }

  return cleaned;
}

module.exports = extractStatementText;