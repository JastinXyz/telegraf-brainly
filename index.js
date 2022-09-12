require('dotenv').config();
const { BOT_TOKEN } = process.env;

const { Telegraf } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard')
const { Brainly } = require("brainly-scraper-v2");
const brain = new Brainly("id");
var data;

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(makeText(ctx, 'basic'), { parse_mode: 'HTML', reply_markup: Keyboard.make([
        Key.url('🐈 Source Code on Github', 'https://github.com/JastinXyz/telegraf-brainly'),
    ]).inline().reply_markup });
});

bot.help((ctx) => {
  let text = makeText(ctx, 'basic') + `\n\n<i>📖 Command List</i>\n/start - Menjalankan bot sekaligus berisi panduan.\n/help - Menu ini.\n/github - Source Code bot ini.`;
  ctx.reply(text, { parse_mode: "HTML", reply_markup: Keyboard.make([
        Key.url('🐈 Source Code on Github', 'https://github.com/JastinXyz/telegraf-brainly'),
    ]).inline().reply_markup })
});

bot.command('github', (ctx) => {
  ctx.reply('🎈 https://github.com/JastinXyz/telegraf-brainly', { reply_markup: Keyboard.make([
        Key.url('🐈 Source Code on Github', 'https://github.com/JastinXyz/telegraf-brainly'),
    ]).inline().reply_markup })
})

bot.on('text', (ctx) => {
  ctx.reply("🔍 Sedang Mencari...").then((xx) => {
    brain.search(ctx.update.message.text, "id").then(async(x) => {
      
      if(x.length === 0) {
        ctx.telegram.editMessageText(xx.chat.id, xx.message_id, undefined, "👀 Tidak ditemukan jawaban apapun! coba cari menggunakan kata kunci lain!")
      } else {
        data = {
          q: ctx.update.message.text,
          a: x,
          ke: 0
        }
       ctx.telegram.editMessageText(xx.chat.id, xx.message_id, undefined, makeText(data), { parse_mode: "HTML", reply_markup: data.a.length !== 1? Keyboard.inline(['➡ Next']).reply_markup : null })
      }
    }).catch((e) => {
       ctx.telegram.editMessageText(xx.chat.id, xx.message_id, undefined, "👀 Oops! Terjadi error saat mencari! Coba lagi...")
      console.log(e)
    });
  })
});

bot.action('➡ Next', (ctx) => {
  try {
    data.ke++;
    ctx.editMessageText(makeText(data), { parse_mode: "HTML", reply_markup: Keyboard.inline(inlinearr(data.ke, data.a.length)).reply_markup })
  } catch(e) {
    console.log(e)
    ctx.reply("👀 Oops! Terjadi error! Coba lagi...")
  }
})

bot.action('⬅ Back', (ctx) => {
  try {
    data.ke--;
    ctx.editMessageText(makeText(data), { parse_mode: "HTML", reply_markup: Keyboard.inline(inlinearr(data.ke, data.a.length)).reply_markup })
  } catch(e) {
    console.log(e)
    ctx.reply("👀 Oops! Terjadi error! Coba lagi...")
  }
})

bot.launch().then(() => {
  console.log("ready!")
});

function inlinearr(n, max) {
  return n >= 1 ? n == parseInt(max-1) ? ['⬅ Back'] : ['⬅ Back', '➡ Next'] : ['➡ Next']
}

function makeText(data, type = "jawaban") {
  if(type === "basic") {
    let ctx = data;
    return `<b>Selamat Datang @${ctx.update.message.from.username}!</b>\n\n<i>⁉ Bagaimana cara menggunakannya?</i> Kamu hanya perlu menuliskan pertanyaannya saja dan kirimkan ke bot ini... Nantinya bot akan mencari jawaban dari pertanyaan tersebut di <a href="http://brainly.co.id">Brainly</a>!\n\n<i>🐛 Menemukan bug? Buat issue baru di repository Github bot ini supaya kedepannya bot ini menjadi lebih baik!</i>`;
  } else {
    if(data.a) {
      let jawaban = data.a[data.ke].answers[0];
      return `<b>${data.a[data.ke].question.content > 2048 ? data.a[data.ke].question.content.slice(0, 2048) + `... dan ${data.a[data.ke].question.content - 2048} karakter lagi.` : data.a[data.ke].question.content}</b>\n\n<i>✋ Terdapat <b>${data.a[data.ke].answers.length}</b> Jawaban! Berikut kami tampilkan jawaban teratas:</i>\n<code>${jawaban.content.length > 1024 ? jawaban.content.slice(0, 1024) + `... dan ${jawaban.content.length - 1024} karakter lagi.` : jawaban.content}</code>\n\n${jawaban.isBest? "🌟 Best\n" : ""}👤 Rank Penjawab: ${jawaban.author? jawaban.author.rank? jawaban.author.rank : "Tidak Diketahui" : "Tidak Diketahui"}\n🔗 https://brainly.co.id/tugas/${data.a[data.ke].question.id}\n🔢 ${data.ke + 1}/${data.a.length}`
    } else {
      return `Tidak ditemukan jawaban apapun.`
    }

  }
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
