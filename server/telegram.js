import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegram(text) {
  if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('[TG]', text.replace(/<[^>]*>/g, ''));
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    });
  } catch (e) {
    console.error('[TG Error]', e.message);
  }
}

export async function sendTelegramDocument(buffer, filename, caption) {
  if (!TOKEN || TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.log('[TG] Document:', filename, caption?.replace(/<[^>]*>/g, ''));
    return;
  }
  try {
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('document', new Blob([buffer], { type: 'application/pdf' }), filename);
    if (caption) form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, { method: 'POST', body: form });
  } catch (e) {
    console.error('[TG Doc Error]', e.message);
  }
}
