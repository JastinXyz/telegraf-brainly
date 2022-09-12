require('dotenv').config();
const { BOT_TOKEN } = process.env;

const { Telegraf, session } = require('telegraf');
const { Keyboard, Key } = require('telegram-keyboard')
const { Brainly } = require("brainly-scraper-v2");
const brain = new Brainly("id");

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());
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
  brain.search(ctx.update.message.text, "id").then((x) => {
    // console.log(x)
    ctx.session = {
      data: {
          q: ctx.update.message.text,
          a: x,
          ke: 0
        }
      }
    ctx.reply(makeText(ctx.session.data), { parse_mode: "HTML", reply_markup: Keyboard.inline(['➡ Next']).reply_markup })
  }).catch((e) => {
    ctx.reply("👀 Oops! Terjadi error saat mencari! Coba lagi...")
    console.log(e)
  });
});

bot.action('➡ Next', (ctx) => {
  try {
    ctx.session.data.ke++;
    ctx.editMessageText(makeText(ctx.session.data), { parse_mode: "HTML", reply_markup: Keyboard.inline(inlinearr(ctx.session.data.ke)).reply_markup })
  } catch(e) {
    console.log(e)
    ctx.reply("👀 Oops! Terjadi error! Coba lagi...")
  }
})

bot.action('⬅ Back', (ctx) => {
  try {
    ctx.session.data.ke--;
    ctx.editMessageText(makeText(ctx.session.data), { parse_mode: "HTML", reply_markup: Keyboard.inline(inlinearr(ctx.session.data.ke)).reply_markup })
  } catch(e) {
    console.log(e)
    ctx.reply("👀 Oops! Terjadi error! Coba lagi...")
  }
})

bot.launch().then(() => {
  console.log("ready!")
});

function inlinearr(n) {
  return n >= 1 ? n == 9 ? ['⬅ Back'] : ['⬅ Back', '➡ Next'] : ['➡ Next']
}

function makeText(data, type = "jawaban") {
  if(type === "basic") {
    let ctx = data;
    return `<b>Selamat Datang @${ctx.update.message.from.username}!</b>\n\n<i>⁉ Bagaimana cara menggunakannya?</i> Kamu hanya perlu menuliskan pertanyaannya saja dan kirimkan ke bot ini... Nantinya bot akan mencari jawaban dari pertanyaan tersebut di <a href="http://brainly.co.id">Brainly</a>!\n\n<i>🐛 Menemukan bug? Buat issue baru di repository Github bot ini supaya kedepannya bot ini menjadi lebih baik!</i>`;
  } else {
    if(data.a) {
      let jawaban = data.a[data.ke].answers[0];
      return `<b>${data.a[data.ke].question.content}</b>\n\n<i>✋ Terdapat <b>${data.a[data.ke].answers.length}</b> Jawaban! Berikut kami tampilkan jawaban teratas:</i>\n<code>${jawaban.content.length > 1024 ? jawaban.content.slice(0, 1024) + `... dan ${jawaban.content.length - 1024} karakter lagi.` : jawaban.content}</code>\n\n${jawaban.isBest? "🌟 Best\n" : ""}👤 Rank Penjawab: ${jawaban.author.rank? jawaban.author.rank : "Tidak Diketahui"}\n🔗 https://brainly.co.id/tugas/${data.a[data.ke].question.id}\n🔢 ${data.ke + 1}/${data.a.length}`
    } else {
      return `Tidak ditemukan jawaban apapun.`
    }

  }
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
