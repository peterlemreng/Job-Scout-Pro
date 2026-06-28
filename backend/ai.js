require("dotenv").config();
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function debugCode({ error, code, context }) {
  const response = await client.responses.create({
    model: "gpt-5.5",
    input: `
You are a senior software engineer debugging a Node.js/Express/MySQL project.

TASK:
Find the root cause and fix the issue.

ERROR:
${error}

CODE:
${code}

CONTEXT:
${context || "N/A"}

Return:
1. Root cause
2. Fix
3. Corrected code
    `,
  });

  return response.output_text;
}

module.exports = { debugCode };
