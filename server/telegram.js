import dotenv from 'dotenv';
dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const READY = TOKEN && TOKEN !== 'YOUR_BOT_TOKEN_HERE' && CHAT_ID && CHAT_ID !== 'YOUR_CHAT_ID_HERE';

function log(msg) { console.log(`[TG] ${msg}`); }

async function tgFetch(url, body) {
    if (!READY) { log(`[SKIP] Not configured — would send: ${JSON.stringify(body).substring(0, 120)}`); return null; }
    try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const json = await res.json();
        if (json.ok) {
            log(`[OK] Sent to chat ${CHAT_ID} (msg_id: ${json.result?.message_id})`);
        } else {
            log(`[FAIL] Telegram API error: ${json.description || JSON.stringify(json)}`);
        }
        return json;
    } catch (e) {
        log(`[ERROR] ${e.message}`);
        return null;
    }
}

async function tgFetchMultipart(url, formData) {
    if (!READY) { log(`[SKIP] Not configured — would send document`); return null; }
    try {
        const res = await fetch(url, { method: 'POST', body: formData });
        const json = await res.json();
        if (json.ok) {
            log(`[OK] Document sent (msg_id: ${json.result?.message_id})`);
        } else {
            log(`[FAIL] Telegram API error: ${json.description || JSON.stringify(json)}`);
        }
        return json;
    } catch (e) {
        log(`[ERROR] Document send failed: ${e.message}`);
        return null;
    }
}

export async function sendTelegram(text) {
    log(`[SEND] sendMessage → chat_id: ${CHAT_ID}`);
    log(`[MSG] ${text.replace(/<[^>]*>/g, '').substring(0, 200)}`);
    return tgFetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
        chat_id: CHAT_ID, text, parse_mode: 'HTML',
    });
}

export async function sendTelegramDocument(buffer, filename, caption) {
    log(`[SEND] sendDocument → ${filename} (${buffer.length} bytes)`);
    if (!READY) {
        log(`[SKIP] Not configured — document: ${filename}`);
        return null;
    }
    const form = new FormData();
    form.append('chat_id', CHAT_ID);
    form.append('document', new Blob([buffer], { type: 'application/pdf' }), filename);
    if (caption) form.append('caption', caption);
    form.append('parse_mode', 'HTML');
    return tgFetchMultipart(`https://api.telegram.org/bot${TOKEN}/sendDocument`, form);
}

export function tgStatus() {
    log(`Configured: ${READY} | Token: ${TOKEN ? TOKEN.substring(0, 10) + '...' : 'N/A'} | Chat: ${CHAT_ID || 'N/A'}`);
}
