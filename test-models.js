require('dotenv').config({path: '.env.local'});
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
fetch(url).then(r => r.json()).then(d => console.log(d.models.map(m => m.name))).catch(console.error);
