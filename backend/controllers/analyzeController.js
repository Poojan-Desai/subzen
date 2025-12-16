require("dotenv").config();
const extractStatementText = require("../utils/pdfParser");
const OpenAI = require("openai");

// Initialize OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Pick model based on user plan
 */
function chooseModel(plan) {
  const p = (plan || "free").toLowerCase();

  if (p === "pro" || p === "premium" || p === "premium+") {
    return "gpt-4.1"; // stronger, more accurate
  }

  return "gpt-4.1-mini"; // cheaper for free tier
}

/**
 * MAIN STATEMENT ANALYZER
 */
exports.analyzeStatement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const plan = (req.query.plan || "free").toLowerCase();

    // Extract readable text from PDF/CSV
    const statementText = await extractStatementText(req.file);

    // Ensure size safe for OpenAI
    let trimmed = statementText;
    if (trimmed.length > 15000) trimmed = trimmed.slice(0, 15000);

    const model = chooseModel(plan);

    // ----------------------------------------------
    // 🔥 The intelligent prompt for clean JSON output
    // ----------------------------------------------
    const prompt = `
You are an AI financial assistant for a budgeting app called SubZen.
The user will provide raw text extracted from a real bank statement.

Your job:

1. Identify ALL recurring subscriptions.
   Estimate:
   - name
   - amount
   - frequency (monthly/weekly/yearly/unknown)
   - keep_cancel ("keep", "cancel", "downgrade")
   - reason (short explanation)

2. Calculate:
   - total_subscription_spend
   - estimated_savings_if_cancel_recommended

3. Categorize spending totals:
{
  "subscriptions": number,
  "food_and_drink": number,
  "transportation": number,
  "shopping": number,
  "entertainment": number,
  "other": number
}

4. Write a short summary (2–4 sentences).

5. Give 3–6 money-saving suggestions.

Rules:
- ALWAYS output **valid JSON only**
- Never include backticks
- If unsure, estimate logically

STATEMENT TEXT:
${trimmed}
    `.trim();

    // ----------------------------------------------
    // 🔥 Call OpenAI
    // ----------------------------------------------
    const ai = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You return ONLY JSON. No commentary, no ``` blocks, no text outside JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const output = ai.choices?.[0]?.message?.content || "{}";

    let parsed;

    try {
      parsed = JSON.parse(output);
    } catch (err) {
      console.error("JSON parse failed. Raw output:", output);

      // Attempt cleanup
      const cleaned = output
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    }

    return res.json({
      ok: true,
      plan,
      fileName: req.file.originalname,
      analysis: parsed,
    });
  } catch (err) {
    console.error("❌ analyzeStatement ERROR:", err);

    return res.status(500).json({
      error:
        err.message ||
        "Failed to analyze statement. Try a different PDF/CSV export.",
    });
  }
};