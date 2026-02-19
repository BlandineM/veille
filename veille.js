const Parser = require('rss-parser');
const parser = new Parser();

const RSS_URL = 'https://web.dev/feed.xml';
const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function fetchNews() {
  console.log("Démarrage de la récupération RSS...");
  const feed = await parser.parseURL(RSS_URL);
  const latest = feed.items[0];
  console.log("Article trouvé :", latest.title);
  console.log("Clé API présente :", !!GEMINI_API_KEY);

  const linkFr = latest.link.includes('?') ? `${latest.link}&hl=fr` : `${latest.link}?hl=fr`;

const prompt = `
    Analyse ce titre : "${latest.title}".
    Rédige un message court pour des développeurs.
    Format strict :
    Le Pourquoi : (pertinence équipe dev)
    Le "Takeaway" : (info technique clé)
    Réponds en français, SANS Markdown, SANS gras, juste le texte.
  `;

  console.log("Appel à l'IA Gemini...");
const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const aiData = await response.json();
  
  if (aiData.error) {
    console.error("Détails erreur API :", JSON.stringify(aiData.error));
    throw new Error(`Erreur Gemini API: ${aiData.error.message}`);
  }

  // Nettoyage du texte au cas où Gemini mettrait des balises Markdown
  let aiText = aiData.candidates[0].content.parts[0].text;
  aiText = aiText.replace(/\*/g, '');
  
  const message = {
    text: `🚀 **#Tech : ${latest.title}**\n\n${aiText}\n\n*Source : [Lire l'article](${linkFr})*`
  };

  console.log("Envoi vers Google Chat...");
  const webhookResponse = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(message),
  });

  if (webhookResponse.ok) {
    console.log("Succès ! Message posté.");
  } else {
    console.log("Erreur Webhook:", await webhookResponse.text());
  }
}

fetchNews().catch(err => {
  console.error("ERREUR FATALE:", err);
  process.exit(1);
});
