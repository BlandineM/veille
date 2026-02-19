const Parser = require('rss-parser');
//const { GoogleGenerativeAI } = require("@google/generative-ai");

const parser = new Parser();
//const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const RSS_URL = 'https://web.dev/feed.xml';
const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK;

async function fetchNews() {
  console.log("Démarrage de la récupération RSS...");
  const feed = await parser.parseURL(RSS_URL);
  const latest = feed.items[0];
  console.log("Article trouvé :", latest.title);
  
  //const modelName = "gemini-1.5-flash-latest"; 
  //console.log(`Tentative avec le modèle : ${modelName}`);
  
  //const model = genAI.getGenerativeModel({ model: modelName });
  
/*const prompt = `
    Analyse ce titre : "${latest.title}".
    Rédige un message court pour des développeurs.
    Format strict :
    Le Pourquoi : (pertinence équipe dev)
    Le "Takeaway" : (info technique clé)
    Réponds en français, SANS Markdown, SANS gras, juste le texte.
  `;

 console.log("Appel à Gemini 3...");
  const result = await model.generateContent(prompt);
const aiText = result.response.text();*/

  const linkFr = latest.link.includes('?') ? `${latest.link}&hl=fr` : `${latest.link}?hl=fr`;

 /* const message = {
    text: `🚀 **#Tech : ${latest.title}**\n\n${aiText}\n\n*Source : [Lire l'article](${linkFr})*`
  };*/

  const message = {
    text: `🚀 **#Tech : ${latest.title}**\n\n` +
          `**Le Pourquoi :** Mise à jour critique des standards du Web pour 2026 impactant l'interopérabilité navigateurs.\n\n` +
          `**Le "Takeaway" :** Les moteurs de rendu s'alignent sur de nouvelles fonctionnalités CSS et JS pour réduire les hacks spécifiques aux navigateurs.\n\n` +
          `*Source : [Lire l'article](${linkFr})*`
  };

  console.log("Envoi vers Google Chat...");
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(message),
  });
  
if (response.ok) {
    console.log("Succès total ! Le message est dans le channel.");
  } else {
    console.log("Erreur Webhook :", await response.text());
  }
}

fetchNews().catch(err => {
  console.error("ERREUR FATALE:", err);
  process.exit(1);
});
