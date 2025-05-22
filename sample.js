const TOKEN = "7902584559:AAG56gpPIoqUFjSYKCOuVF4opqVClUTcBIk";
const GEMINI_API_KEY = "AIzaSyDWbMEoUXxXTzDUMXCjvOz_qdnyM9d6LnA"
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

async function sendMessage(chat_id, text, reply_markup = {}) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id, text, reply_markup })
  });
}

async function handleUpdate(update) {
  const chat_id = update.message?.chat.id || update.callback_query?.message.chat.id;

  if (update.message?.text) {
    const text = update.message.text.trim();

    if (text.toLowerCase().startsWith("/start")) {
      await sendMessage(chat_id, "سلام! سوالت رو بپرس :)");
      return;
    }

    try {
      const response = await fetch(GEMINI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }]
        })
      });

      const json = await response.json();
      const answer = json.candidates?.[0]?.content?.parts?.[0]?.text || "پاسخی پیدا نشد.";
      await sendMessage(chat_id, answer);
    } catch (err) {
      console.error("Gemini error:", err);
      await sendMessage(chat_id, "خطا در ارتباط با Gemini!");
    }
  }
}

export default {
  async fetch(request) {
    if (request.method === "POST") {
      try {
        const update = await request.json();
        await handleUpdate(update);
        return new Response("OK");
      } catch (error) {
        console.error("Error processing request:", error);
        return new Response("Error", { status: 500 });
      }
    }
    return new Response("ربات فعال است.");
  }
};
