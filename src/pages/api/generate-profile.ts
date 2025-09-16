import express from 'express';
import { openai } from '../openai.js'; // or your AI client

const router = express.Router();

router.post('/', async (req, res) => {
  const { fileUrl, companyProfile } = req.body;

  // Pull the file (CV) from Supabase or directly from fileUrl
  // Send to OpenAI / your model
  const prompt = `Create a team member profile from the following data:
Company Profile: ${companyProfile}
CV File: ${fileUrl}
Return JSON with name, role, bio, key skills.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    const text = completion.choices[0].message.content;
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate profile' });
  }
});

export default router;
