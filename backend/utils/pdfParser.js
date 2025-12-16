const pdfParse = require("pdf-parse");

async function parsePDF(buffer) {
    try {
        const data = await pdfParse(buffer);
        return data.text || "";
    } catch (error) {
        console.error("PDF parsing error:", error);
        return "";
    }
}

module.exports = { parsePDF };