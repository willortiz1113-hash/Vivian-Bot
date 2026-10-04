const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const token = process.env.TELEGRAM_BOT_TOKEN;
const apiKey = process.env.GEMINI_API_KEY;

if (!token || !apiKey) {
  console.error("❌ ERROR: Faltan las variables TELEGRAM_BOT_TOKEN o GEMINI_API_KEY");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log("🤖 Vivian está iniciándose correctamente...");

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    const result = await model.generateContent(text);
    const response = await result.response;
    bot.sendMessage(chatId, response.text());
  } catch (error) {
    console.error("Error al procesar mensaje con Gemini:", error);
    bot.sendMessage(chatId, "Ups, tuve un problema al procesar tu solicitud.");
  }
});


