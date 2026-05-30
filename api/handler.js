import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { type, systemPrompt, userMessage } = req.body;

    if (!type || !systemPrompt || !userMessage) {
      res.status(400).json({ error: "Missing required fields: type, systemPrompt, userMessage" });
      return;
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: type === "production" ? 8000 : 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const generatedText = message.content[0].type === "text" ? message.content[0].text : "";

    res.status(200).json({ success: true, content: generatedText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate content" });
  }
}
