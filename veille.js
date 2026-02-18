const Parser = require('rss-parser');
const parser = new Parser();

const RSS_URL = 'https://web.dev/feed.xml';
const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function fetchNews() {
  const feed = await parser.parseURL(RSS_URL);
  const latest = feed.items[0];

  // Forçage du lien en Français si possible via le paramètre hl=fr
  const linkFr = latest.link.includes('?') ? `${latest.link}&hl=fr` : `${latest.link}?hl=fr`;

  // On demande à l'IA de rédiger le contenu selon tes règles
  const prompt = `
    Analyse ce titre d'article tech : "${latest.title}".
    Rédige un message court pour mes collègues développeurs en suivant strictement ce format :
    Le Pourquoi : Une phrase expliquant pourquoi c'est pertinent pour une équipe de dev.
    Le "Takeaway" : L'info technique principale à retenir.
    Sois concis et technique. Réponds en français.
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const aiData = await response.json();
  const aiText = aiData.candidates[0].content.parts[0].text;

  const message = {
    text: `🚀 **#Tech : ${latest.title}**\n\n${aiText}\n\n*Source : [Lire l'article](${linkFr})*`
  };

  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(message),
  });
}

fetchNews().catch(console.error);
