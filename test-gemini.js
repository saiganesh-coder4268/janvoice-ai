require('dotenv').config({path: '.env.local'});
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'test' }] }],
    generationConfig: { temperature: 0.2 }
  })
}).then(res => res.json()).then(console.log).catch(console.error);
