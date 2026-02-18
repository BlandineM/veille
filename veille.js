const RSS_URL = 'https://web.dev/feed.xml'; // Exemple : Blog Google Developers
const WEBHOOK_URL = process.env.GOOGLE_CHAT_WEBHOOK;

async function fetchNews() {
  const rssParser = require('rss-url-parser'); // Il faudra l'ajouter au package.json
  const data = await rssParser(RSS_URL);
  const latest = data[0]; // On prend le dernier article

  const message = {
    text: `🚀 **#Tech : ${latest.title}**\n\n` +
          `**Le Pourquoi :** Cette mise à jour impacte nos standards de performance Web actuels.\n\n` +
          `**Le "Takeaway" :** Contrairement aux anciennes méthodes JS, cette approche permet un chargement optimisé sans bloquer le thread principal.\n\n` +
          `*Source : ${latest.link}*`
  };

  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(message),
  });
  
  console.log("Message envoyé avec succès !");
}

fetchNews().catch(console.error);
