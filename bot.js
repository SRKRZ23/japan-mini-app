// ============================================
// NIHONGO QUEST BOT - Telegram Bot Backend
// Works with Railway, Render, Fly.io
// ============================================

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://nihongomini.netlify.app';

// ============ VALIDATION ============
if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is not set!');
  console.error('Set it in Railway Variables or run: BOT_TOKEN=xxx node bot.js');
  process.exit(1);
}

if (parseInt(process.version.slice(1)) < 18) {
  console.error('❌ Node.js 18+ required! Current:', process.version);
  process.exit(1);
}

console.log('🚀 Starting Nihongo Quest Bot...');
console.log('📦 Node version:', process.version);
console.log('🌐 WebApp URL:', WEBAPP_URL);

// ============ TELEGRAM API HELPERS ============
async function tgRequest(method, body = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!data.ok) {
      console.error(`❌ ${method} failed:`, data.description);
    }
    return data;
  } catch (err) {
    console.error(`🔴 ${method} network error:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function sendMessage(chatId, text, replyMarkup = null) {
  return tgRequest('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: replyMarkup
  });
}

// ============ MESSAGE HANDLERS ============
async function handleStart(chatId, firstName) {
  const name = firstName ? `, ${firstName}` : '';
  const text = `🎌 <b>Nihongo Quest</b>\n\n` +
    `Привет${name}! Готов учить японский? 🇯🇵\n\n` +
    `📚 Уроки с аудио и картинками\n` +
    `⭐ Собирай звезды и XP\n` +
    `🏆 Соревнуйся с друзьями\n\n` +
    `Нажми на кнопку ниже, чтобы начать!`;

  const keyboard = {
    inline_keyboard: [[
      { text: '🎮 Играть', web_app: { url: WEBAPP_URL } }
    ]]
  };

  await sendMessage(chatId, text, keyboard);
}

async function handleHelp(chatId) {
  const text = `ℹ️ <b>Помощь</b>\n\n` +
    `<b>Команды:</b>\n` +
    `/start — 🎮 Начать игру\n` +
    `/help — ℹ️ Эта справка\n` +
    `/stats — 📊 Твоя статистика\n` +
    `/lang — 🌍 Сменить язык\n\n` +
    `<b>Как играть:</b>\n` +
    `1. Слушай аудио 🔊\n` +
    `2. Смотри картинки 🖼️\n` +
    `3. Выбирай правильный ответ 🇯🇵\n\n` +
    `Зарабатывай XP, собирай звезды ⭐ и поднимайся в рейтинге! 🏆`;

  await sendMessage(chatId, text);
}

async function handleStats(chatId, userId) {
  // Заглушка — потом можно подключить Supabase
  const text = `📊 <b>Твоя статистика</b>\n\n` +
    `Открой приложение, чтобы посмотреть полную статистику в разделе <b>Profile</b>!\n\n` +
    `Там ты увидишь:\n` +
    `⭐ Заработанные звезды\n` +
    `⚡ Опыт (XP)\n` +
    `🔥 Стрик\n` +
    `🏆 Достижения`;

  const keyboard = {
    inline_keyboard: [[
      { text: '📊 Открыть профиль', web_app: { url: WEBAPP_URL } }
    ]]
  };

  await sendMessage(chatId, text, keyboard);
}

async function handleLang(chatId) {
  const text = `🌍 <b>Выбор языка</b>\n\n` +
    `Язык можно сменить прямо в приложении — нажми на переключатель <b>RU / UZ / EN</b> в правом верхнем углу!`;

  const keyboard = {
    inline_keyboard: [[
      { text: '🌐 Открыть приложение', web_app: { url: WEBAPP_URL } }
    ]]
  };

  await sendMessage(chatId, text, keyboard);
}

async function handleUnknown(chatId, text) {
  await sendMessage(
    chatId,
    `🤔 Не понимаю команду "<code>${escapeHtml(text)}</code>"\n\nНапиши /start, чтобы начать игру!`
  );
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ============ MAIN ROUTER ============
async function handleUpdate(update) {
  const message = update.message || update.edited_message;
  if (!message) return;

  const chatId = message.chat.id;
  const userId = message.from?.id;
  const firstName = message.from?.first_name;
  const text = message.text || '';

  console.log(`📨 [${chatId}] ${firstName || 'User'}: ${text}`);

  try {
    if (text === '/start' || text.startsWith('/start ')) {
      await handleStart(chatId, firstName);
    } else if (text === '/help') {
      await handleHelp(chatId);
    } else if (text === '/stats') {
      await handleStats(chatId, userId);
    } else if (text === '/lang') {
      await handleLang(chatId);
    } else if (text.startsWith('/')) {
      await handleUnknown(chatId, text);
    } else {
      // Любое не-командное сообщение — тоже предлагаем играть
      const keyboard = {
        inline_keyboard: [[
          { text: '🎮 Играть', web_app: { url: WEBAPP_URL } }
        ]]
      };
      await sendMessage(chatId, 'Напиши /start, чтобы начать игру! 🎌', keyboard);
    }
  } catch (err) {
    console.error('🔴 Handler error:', err.message);
  }
}

// ============ POLLING LOOP ============
let lastUpdateId = 0;
let isPolling = false;

async function poll() {
  if (isPolling) return;
  isPolling = true;

  while (true) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.ok) {
        console.error('❌ getUpdates error:', data.description);
        if (data.error_code === 409) {
          console.error('⚠️ Conflict: another bot instance is running. Waiting 10s...');
          await new Promise(r => setTimeout(r, 10000));
        } else {
          await new Promise(r => setTimeout(r, 5000));
        }
        continue;
      }

      if (data.result && data.result.length > 0) {
        for (const update of data.result) {
          lastUpdateId = update.update_id;
          await handleUpdate(update);
        }
      }
    } catch (err) {
      console.error('🔴 Poll error:', err.message);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

// ============ STARTUP ============
(async () => {
  // Убираем webhook (нужно для getUpdates)
  console.log('🧹 Removing webhook...');
  const webhookRes = await tgRequest('deleteWebhook', { drop_pending_updates: false });
  if (webhookRes.ok) {
    console.log('✅ Webhook removed');
  }

  // Проверяем токен
  const me = await tgRequest('getMe');
  if (!me.ok) {
    console.error('❌ Invalid BOT_TOKEN. Exiting.');
    process.exit(1);
  }
  console.log(`✅ Bot: @${me.result.username} (${me.result.first_name})`);

  // Запускаем polling
  console.log('🤖 Bot is running. Send /start in Telegram!');
  console.log('─'.repeat(50));
  await poll();
})();

// ============ GRACEFUL SHUTDOWN ============
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down bot...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('🔴 Unhandled rejection:', err);
});

