const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');

// Inicializar Bot y Gemini usando las variables de entorno de Railway
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log('🤖 Vivian está iniciándose...');

// Manejar todos los mensajes
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  // 1. Mensajes de texto
  if (msg.text) {
    if (msg.text === '/start') {
      return bot.sendMessage(chatId, '¡Hola! Soy Vivian, tu asistente personal. ¿En qué te puedo ayudar hoy?');
    }

    try {
      await bot.sendChatAction(chatId, 'typing');
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: msg.text,
      });

      bot.sendMessage(chatId, response.text);
    } catch (error) {
      console.error('Error al procesar texto:', error);
      bot.sendMessage(chatId, 'Ocurrió un error al procesar tu mensaje.');
    }
  }

  // 2. Mensajes de voz / Audio
  if (msg.voice) {
    try {
      await bot.sendChatAction(chatId, 'typing');

      // Descargar el audio desde Telegram
      const fileId = msg.voice.file_id;
      const fileLink = await bot.getFileLink(fileId);

      const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
      const audioBuffer = Buffer.from(response.data);

      // Enviar audio a Gemini
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: msg.voice.mime_type || 'audio/ogg',
              data: audioBuffer.toString('base64'),
            },
          },
          'Escucha esta nota de voz y responde de manera clara y amigable como Vivian, la asistente personal.',
        ],
      });

      bot.sendMessage(chatId, aiResponse.text);
    } catch (error) {
      console.error('Error al procesar nota de voz:', error);
      bot.sendMessage(chatId, 'No pude procesar tu nota de voz.');
    }
  }
});

