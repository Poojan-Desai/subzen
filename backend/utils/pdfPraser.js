const pdfParse = require("pdf-parse");

/**
 * Extract cleaned transaction text from a PDF or CSV bank statement.
 * Automatically handles:
 *  - multi-column PDFs
 *  - headers/footers
 *  - noisy spacing
 *  - CSV fallback
 */

async function extractStatementText(file) {
  const { buffer, mimetype, originalname } = file;

  let rawText = "";
  const lower = originalname.toLowerCase();

  try {
    // PDF Files
    if (mimetype === "application/pdf" || lower.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      rawText = pdfData.text || "";
    }

    // CSV or plain text
    else if (
      mimetype === "text/csv" ||
      mimetype === "text/plain" ||
      lower.endsWith(".csv") ||
      lower.endsWith(".txt")
    ) {
      rawText = buffer.toString("utf8");
    }

    // Default fallback
    else {
      rawText = buffer.toString("utf8");
    }
  } catch (err) {
    console.error("❌ Error parsing file:", err);
    throw new Error("Could not read this file. Try a different export format.");
  }

  // Ensure text exists
  if (!rawText || rawText.trim().length < 20) {
    throw new Error("File contained too little readable text.");
  }

  // Normalize whitespace
  let cleaned = rawText
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  // Split into lines
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  // Detect likely transaction rows
  const transactionLines = lines.filter((line) => {
    const hasDate =
      /\b(\d{1,2}\/\d{1,2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(
        line
      );

    const hasMoney =
      /[$€£]?\s?-?\d{1,4}(?:,\d{3})*(\.\d{2})/.test(line);

    return (hasDate && line.length > 15) || hasMoney;
  });

  // If enough transaction lines detected → use them
  if (transactionLines.length >= 5) {
    return transactionLines.join("\n");
  }

  // Otherwise → fallback to cleaned text
  return cleaned;
}
// utils/pdfParser.js
const pdfParse = require("pdf-parse");

async function pdfParser(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || "";
  } catch (err) {
    console.error("PDF PARSE ERROR:", err);
    return "";
  }
}

module.exports = pdfParser;
module.exports = extractStatementText;