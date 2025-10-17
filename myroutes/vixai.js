import express from "express";
import Bytez from "bytez.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const sdk = new Bytez(process.env.KEY2);
const model = sdk.model("janhq/Jan-v1-4B");

// Main route: /1?prompt=Hello
router.get("/", async (req, res) => {
  const prompt = req.query.prompt;

  if (!prompt) {
    return res.status(400).json({
      status: false,
      result: [{ response: "Prompt is required" }],
    });
  }

  try {
    const { error, output } = await model.run(
      [
        {
          role: "system",
          content:
            "You are VixAI (version 4) (developed by Gus & Axentra API), a helpful AI assistant that answers concisely and clearly (You are a smarter than ChatGPT-4o).",
        },
        { role: "user", content: prompt },
      ],
      {
        temperature: 0.7,
        max_new_tokens: 1700,
        min_new_tokens: 5,
      }
    );

    if (error) {
      let cleanError = error;
      if (typeof cleanError === "string" && /^Rejected:/i.test(cleanError))
        cleanError = "Rejected: Try again later!";
      return res.status(500).json({
        status: false,
        result: [{ response: cleanError }],
      });
    }

    let responseText =
      typeof output === "object" && output.content ? output.content : output;
    responseText = responseText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

    if (/^Rejected:/i.test(responseText)) {
      responseText = "Rejected: Try again later!";
      return res.json({
        status: false,
        result: [{ response: responseText }],
      });
    }

    res.json({
      status: true,
      result: [{ response: responseText }],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      result: [{ response: "Something went wrong" }],
    });
  }
});

router.use((req, res) => {
  res.status(404).json({
    status: false,
    result: [{ response: "Route not found" }],
  });
});

export default router;
