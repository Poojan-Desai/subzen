const pdfParser = require("../utils/pdfParser");
const csvParser = require("../utils/csvParser");
const OpenAI = require("openai");

// Ensure OpenAI API key exists
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze uploaded bank statement (PDF or CSV)
 */
exports.analyzeStatement = async (req, res) => {
  try {
    // File missing?
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = req.file.originalname.toLowerCase();
    let extractedText = "";

    // PDF processing
    if (fileName.endsWith(".pdf")) {
      extractedText = await pdfParser(req.file.buffer);
    }

    // CSV processing
    else if (fileName.endsWith(".csv")) {
      extractedText = await csvParser(req.file.buffer);
    }

    // Unsupported file type
    else {
      return res.status(400).json({ error: "Only PDF or CSV files are allowed" });
    }

    // If extracted text is empty
    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        error: "The file could not be read or does not contain enough data.",
      });
    }

    // Ask AI to identify subscriptions + summarize spending categories
    const aiPrompt = `
You are SubZen, an AI financial assistant.

Below is a user's bank statement text. Extract:

1. **List of recurring subscriptions**
   - Name
   - Monthly price
   - Category (Entertainment, Utilities, Shopping, etc.)
   - Cancel recommendation (yes/no)

2. **Monthly spending summary**
   - Total spent
   - Categories + amounts
   - Savings estimate (if they cancelled suggested subscriptions)

Bank Statement Text:
"${extractedText}"
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [{ role: "user", content: aiPrompt }],
      temperature: 0.2,
    });

    const aiResponse = completion.choices[0].message.content;

    return res.json({
      success: true,
      message: "Analysis complete",
      analysis: aiResponse,
    });

  } catch (error) {
    console.error("Analyze Error:", error);
    return res.status(500).json({
      error: "An error occurred while analyzing the statement.",
    });
  }
};