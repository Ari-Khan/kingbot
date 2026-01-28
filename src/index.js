import dotenv from "dotenv";
import { Client, GatewayIntentBits, ActivityType, EmbedBuilder } from "discord.js";
import mongoose from "mongoose";
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { OpenAI } from "openai";
import { Ollama } from "ollama";
import YahooFinance from "yahoo-finance2";
import {
  MojaveDesertImage1,
  MojaveDesertImage2,
  MojaveDesertImage3,
  MojaveDesertImage4,
  MojaveDesertImage5,
  MojaveDesertImage6,
  MojaveDesertImage7,
  MojaveDesertImage8,
  MojaveDesertImage9,
  MojaveDesertImage10,
  ClassMeme1,
  ClassMeme2,
  ClassMeme3,
  ClassMeme4,
  ClassMeme5,
  ClassMeme6,
  ClassMeme7,
  ClassMeme8,
  ClassMeme9,
  ClassMeme10,
  ClassMeme11,
  ClassMeme12,
  ClassMeme13,
  ClassMeme14,
  ClassMeme15,
  ClassMeme16,
  ClassMeme17,
  ClassMeme18,
  ClassMeme19,
  ClassMeme20,
  ClassMeme21,
  ClassMeme22,
  ClassMeme23,
  ClassMeme24,
  ClassMeme25,
  ClassMeme26,
  ClassMeme27,
  ClassMeme28,
  ClassMeme29,
  ClassMeme30,
  ClassMeme31,
  ClassMeme32,
  ClassMeme33,
  ClassMeme34,
  ClassMeme35,
  ClassMeme36,
  ClassMeme37,
  ClassMeme38,
  ClassMeme39,
  ClassMeme40,
  ClassMeme41,
  ClassMeme42,
  ClassMeme43,
  randomJokeList,
  randomLongJokeList,
  randomFactList,
  randomAriQuoteList,
  movieLinks,
  raceWordBank,
  testWordBank,
  values,
} from "./constants.js";
import ChatHistory from "./schemas/chat-history.js";
import Count from "./schemas/count.js";
import User from "./schemas/users.js";
import KingBotStock from "./schemas/kingBotStock.js";
import BannedUser from "./schemas/banned-users.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const googleGenAIClient = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const safetySettings = [
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
];

async function generateWithGeminiFlash(prompt) {
  const response = await googleGenAIClient.models.generateContent({
    model: "gemini-3.0-flash-preview",
    contents: prompt,
    config: {
      temperature: 1.25,
    },
    safetySettings,
  });

  return response.text || "";
}

async function chatWithGeminiFlash(prompt, history = []) {
  const chat = googleGenAIClient.chats.create({
    model: "gemini-3.0-flash-preview",
    temperature: 1.25,
    safetySettings: safetySettings,
    history,
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text || "";
}

async function generateWithGeminiPro(prompt) {
  const response = await googleGenAIClient.models.generateContent({
    model: "gemini-pro-latest",
    contents: prompt,
    config: {
      temperature: 1.25,
    },
    safetySettings,
  });

  return response.text || "";
}

async function visionWithGeminiFlash(prompt, imageAttachment) {
  const imageArrayBuffer = await fetch(imageAttachment.url).then(res => res.arrayBuffer());
  const imageBuffer = Buffer.from(imageArrayBuffer);
  const base64Image = imageBuffer.toString("base64");

  const contents = [
    {
      inlineData: {
        mimeType: imageAttachment.contentType || "image/png",
        data: base64Image,
      },
    },
    { text: prompt },
  ];

  const response = await googleGenAIClient.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents,
    config: { 
      temperature: 1.25 
    },
    safetySettings,
  });

  return response.text || "";
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });
const ollama = new Ollama({ baseURL: "http://localhost:11434/api/generate" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
});

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

client.setMaxListeners(Infinity);

let totalUsers = 0;
let totalGuilds = 0;

client.on("clientReady", async (c) => {
  let totalUsers = 0;

  for (const guild of client.guilds.cache.values()) {
    const members = await guild.members.fetch();
    totalUsers += members.filter(m => !m.user.bot).size;
  }

  const totalGuilds = client.guilds.cache.size;

  const status = [
    { name: "$help", type: ActivityType.Playing },
    { name: `${totalUsers} users!`, type: ActivityType.Watching },
    { name: "$help", type: ActivityType.Playing },
    { name: `${totalUsers} users!`, type: ActivityType.Watching },
    { name: `${totalGuilds} servers!`, type: ActivityType.Watching },
  ];

  console.log(`${c.user.tag} is Online!`);

  setInterval(() => {
    const random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10_000);
});

//Information/Management
client.on("messageCreate", (message) => {
  if (message.content === "$help") {
    message.reply(
      "**List of commands:** \n\n**Information/Management** \n($)help = List of Commands \n($)kingbot = Bot Information \n($)ping = Bot Latency \n($)uptime = Bot Uptime \n($)version = Bot Version \n($)links = Bot Links \n\n**Entertainment** \n($)joke = Responds with a Random Joke \n($)longjoke = Responds with a Random Long Joke \n($)fact = Responds with a Random Fact \n($)ari = Responds with a Random Ari Quote \n($)typetest = Test your typing speed \n($)typerace = Challenge your typing skills \n\n**Economy** \n($)start = Create a KingBot account \n($)bal = Check the balance of yourself or another user \n($)daily = Claim your daily salary \n($)claim = Claim your hourly salary \n($)vote = Claim your top.gg upvote reward \n($)pay = Transfer funds to another user \n($)net = Check the net worth of yourself or another user \n($)leaderboard = View the global leaderboard \n($)netleaderboard = View the global net worth leaderboard \n\n**Casino** \n($)coinflip = Bet money on a coin flip \n($)blackjack = Bet money on blackjack \n($)crash = Bet money on crash \n($)limbo = Bet money on limbo \n\n**Stocks** \n($)buy = Purchase a stock at its market price (24/7) \n($)sell = Sell a stock at its market price (24/7) \n($)portfolio = View your stock portfolio \n($)stock = View information on a stock \n($)exchange = Exchange a currency at its current rate \n($)currency = View all of your currency balances \n\n**Media** \n($)img = Sends an image in the server \n($)movie = Watch a movie in the server \n($)classmeme = Sends a class meme in the server \n($)news = View the latest news stories worldwide \n\n**Artificial Intelligence** \n($)gemini = Ask Google Gemini a prompt \n($)chat = Interact with Gemini Chat \n($)nameset = Set your name for Gemini Chat \n($)vision = Send an image to Gemini Chat \n($)visual = Analyze an image with Gemini \n($)image = Generate an image with AI \n\n**Miscellaneous** \n($)topgg = Check out the bot's top.gg page \n($)count = Adds 1 to the Count"
    );
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$kingbot") {
    message.reply(
      `Hello. My name is KingBot, and I was a multipurpose Discord Bot created by Ari Khan. My main features are currently an advanced economy, entertainment, and media sharing. I am currently in active development. If you want information about the bot or have suggestions, please contact our lead developer, Ari Khan (<@786745378212282368>). \n\n **Creation Date:** October 29, 2023 \n**Made Public:** November 25, 2023 \n\n**Servers:** ${totalGuilds} \n**Users:** ${totalUsers} \n**Website:** https://www.ari-khan.com/ \n\n**Disclaimer:** KingBot is provided "as is" and is not responsible for any unintended behavior, errors, or outcomes resulting from its use. Users are encouraged to exercise discretion and comply with all applicable rules and laws when interacting with the bot. Features may change during development.`
    );
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$ping") {
    message.reply(
      `Server Latency is **${Date.now() - message.createdTimestamp}ms**.`
    );
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$uptime") {
    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    message.reply(
      `The bot has been online for ${days} ${
        days === 1 ? "day" : "days"
      }, ${hours} ${hours === 1 ? "hour" : "hours"}, ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } and ${seconds} ${seconds === 1 ? "second" : "seconds"}`
    );
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$version") {
    message.reply(
      "**Bot Version** \nThe following are all the versions of KingBot and its dependencies. \n\n**KingBot Version** \n1.6.15.17.9 \n\n**Discord.js Version** \n14.22.1 \n\n**NPM Version** \n11.4.2 \n\n**Node.js Version** \n22.18.0 \n\n**Nodemon Version** \n3.1.10 \n\n**Node-Fetch Version** \n3.3.2 \n\n**DOTENV Version** \n17.2.1 \n\n**FS-Extra Version** \n11.3.1 \n\n**Mongoose Version** \n8.18.0 \n\n**Yahoo Finance (2) Version** \n3.10.2 \n\n**Google GenAI Version** \n1.15.0"
    );
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$links") {
    message.reply(
      "**Top.gg:** \nhttps://top.gg/bot/1168240045510107308 \n**GitHub Repository:** \nhttps://github.com/Ari-Khan/kingbot \n**Website:** \nhttps://www.ari-khan.com"
    );
  }
});

//Admin Information/Management
client.on("messageCreate", (message) => {
  if (message.content === "$adminhelp") {
    if (message.author.id === "786745378212282368") {
      message.reply(
        "**List of admin commands:** \n\n**Information/Management** \n($)adminhelp = List of Admin Commands \n($)adminfixfields = Fix user fields \n\n**Economy** \n($)adminpay = Pay a user any amount of money \n\n**Stocks** \n($)adminkgbstocksplit = Perform a split on KGB stock \n\n**Moderation** \n($)admintimeout = Timeout a user \n($)adminuntimeout = Untimeout a user \n($)adminaiban = Ban a user from using AI features \n($)adminaiunban = Unban a user from using AI features \n\n**Artificial Intelligence** \n($)adminchatgpt = Ask ChatGPT a prompt \n($)admingeminipro = Ask Gemini Pro a prompt \n($)adminllama = Ask Meta LLaMa a prompt \n($)adminzephyr = Ask Zephyr a prompt \n($)adminchatreset = Clear the AI chat history \n\n**Miscellaneous** \n($)adminreact = Make KingBot react to a message"
      );
    } else {
      message.reply("You are not authorized to use this command.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$adminfixfields" && message.author.id === "786745378212282368") {
    try {
      const users = await User.find();

      for (const user of users) {
        let updated = false;

        if (user.username === undefined) {
          try {
            const discordUser = await client.users.fetch(user.discordId);
            user.username = discordUser.username;
            updated = true;
          } catch (err) {
            console.error(`Could not fetch user ${user.discordId}:`, err);
            continue;
          }
        }

        if (user.balance === undefined) {
          user.balance = 0;
          updated = true;
        }
        if (user.lastDailyCollected === undefined) {
          user.lastDailyCollected = null;
          updated = true;
        }
        if (user.lastClaimCollected === undefined) {
          user.lastClaimCollected = null;
          updated = true;
        }
        if (user.lastVoteTimestamp === undefined) {
          user.lastVoteTimestamp = null;
          updated = true;
        }
        if (user.currencies === undefined) {
          user.currencies = {};
          updated = true;
        }
        if (user.name === undefined) {
          user.name = null;
          updated = true;
        }
        if (user.stocks === undefined) {
          user.stocks = [];
          updated = true;
        }

        if (updated) {
          await user.save();
          console.log(`Fixed missing fields for user ${user.discordId}`);
        }
      }

      message.reply("All missing fields have been fixed for user documents.");
    } catch (error) {
      console.error("Error fixing fields:", error);
      message.reply("There was an error fixing fields. Please try again later.");
    }
  }
});

//Entertainment
client.on("messageCreate", (message) => {
  if (message.content === "$joke") {
    const random = Math.floor(Math.random() * randomJokeList.length);
    message.reply(randomJokeList[random]);
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$longjoke") {
    const random = Math.floor(Math.random() * randomLongJokeList.length);
    message.reply(randomLongJokeList[random]);
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$fact") {
    const random = Math.floor(Math.random() * randomFactList.length);
    message.reply(randomFactList[random]);
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "$ari") {
    const random = Math.floor(Math.random() * randomAriQuoteList.length);
    message.reply(randomAriQuoteList[random]);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$typerace")) {
    const args = message.content.split(" ");

    const numWords = parseInt(args[1], 10);
    if (![1, 3, 5, 10, 25, 50, 75, 100].includes(numWords)) {
      return message.reply(
        "Please use `$typerace (1, 3, 5, 10, 25, 50, 75, 100)` to begin a typerace."
      );
    }

    const randomString = getRandomRaceWords(numWords);

    await message.reply(`**Type this:** \n## ${randomString}`);

    const typingStartTime = Date.now();

    const filter = (response) => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", (response) => {
      const typingEndTime = Date.now();
      const timeTaken = (typingEndTime - typingStartTime) / 1000;
      const timeTakenMinutes = timeTaken / 60;

      const userResponse = response.content.trim();
      const correctWords = randomString.split(" ");
      const userWords = userResponse.split(" ");

      let wordMistakes = 0;
      let characterMistakes = 0;

      correctWords.forEach((correctWord, index) => {
        const userWord = userWords[index] || "";

        if (correctWord !== userWord) {
          wordMistakes++;

          const minLength = Math.min(correctWord.length, userWord.length);
          for (let i = 0; i < minLength; i++) {
            if (correctWord[i] !== userWord[i]) {
              characterMistakes++;
            }
          }

          if (correctWord.length !== userWord.length) {
            characterMistakes += Math.abs(correctWord.length - userWord.length);
          }
        }
      });

      const correctCharacters = userResponse.length - characterMistakes;
      const totalCharacters = userResponse.length;

      const wpm = correctCharacters / 5 / timeTakenMinutes;
      const rawWpm = totalCharacters / 5 / timeTakenMinutes;

      message.reply(
        `**Time taken:** ${timeTaken.toFixed(2)} seconds\n` +
          `**Net WPM:** ${wpm.toFixed(2)}\n` +
          `**Raw WPM:** ${rawWpm.toFixed(2)}\n` +
          `**Word Mistakes:** ${wordMistakes}\n` +
          `**Character Mistakes:** ${characterMistakes}`
      );

      collector.stop();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        message.reply(
          `${message.author.username}, you didn't type the string!`
        );
      }
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$typetest")) {
    const args = message.content.split(" ");

    const numWords = parseInt(args[1], 10);
    if (![1, 3, 5, 10, 25, 50, 75, 100].includes(numWords)) {
      return message.reply(
        "Please use `$typetest (1, 3, 5, 10, 25, 50, 75, 100)` to begin a typetest."
      );
    }

    const randomString = getRandomTestWords(numWords);

    await message.reply(`**Type this:** \n## ${randomString}`);

    const typingStartTime = Date.now();

    const filter = (response) => response.author.id === message.author.id;
    const collector = message.channel.createMessageCollector({
      filter,
      time: 300000,
    });

    collector.on("collect", (response) => {
      const typingEndTime = Date.now();
      const timeTaken = (typingEndTime - typingStartTime) / 1000;
      const timeTakenMinutes = timeTaken / 60;

      const userResponse = response.content.trim();
      const correctWords = randomString.split(" ");
      const userWords = userResponse.split(" ");

      let wordMistakes = 0;
      let characterMistakes = 0;

      correctWords.forEach((correctWord, index) => {
        const userWord = userWords[index] || "";

        if (correctWord !== userWord) {
          wordMistakes++;

          const minLength = Math.min(correctWord.length, userWord.length);
          for (let i = 0; i < minLength; i++) {
            if (correctWord[i] !== userWord[i]) {
              characterMistakes++;
            }
          }

          if (correctWord.length !== userWord.length) {
            characterMistakes += Math.abs(correctWord.length - userWord.length);
          }
        }
      });

      const correctCharacters = userResponse.length - characterMistakes;
      const totalCharacters = userResponse.length;

      const wpm = correctCharacters / 5 / timeTakenMinutes;
      const rawWpm = totalCharacters / 5 / timeTakenMinutes;

      message.reply(
        `**Time taken:** ${timeTaken.toFixed(2)} seconds\n` +
          `**Net WPM:** ${wpm.toFixed(2)}\n` +
          `**Raw WPM:** ${rawWpm.toFixed(2)}\n` +
          `**Word Mistakes:** ${wordMistakes}\n` +
          `**Character Mistakes:** ${characterMistakes}`
      );

      collector.stop();
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        message.reply(
          `${message.author.username}, you didn't type the string!`
        );
      }
    });
  }
});

//Economy
client.on("messageCreate", async (message) => {
  if (message.content === "$start") {
    let user = await User.findOne({ discordId: message.author.id });

    if (user) {
      message.reply("You already have an account.");
    } else {
      user = await User.create({
        discordId: message.author.id,
        username: message.author.username,
        balance: 0,
        lastDailyCollected: null,
        lastClaimCollected: null,
        lastVoteTimestamp: null,
        currencies: {},
        name: null,
        stocks: [],
      });

      message.reply("Your account has been created with all fields initialized.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$daily") {
    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with `$start`.");
      return;
    }

    const now = new Date();
    const nextDaily = new Date(user.lastDailyCollected);
    nextDaily.setHours(nextDaily.getHours() + 12);

    if (user.lastDailyCollected && now < nextDaily) {
      const timeUntilNextDaily = nextDaily - now;
      const hours = Math.floor((timeUntilNextDaily / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeUntilNextDaily / (1000 * 60)) % 60);
      const seconds = Math.floor((timeUntilNextDaily / 1000) % 60);

      message.reply(
        `You have already collected your daily salary. Next daily available in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
      );
    } else {
      user.balance += 100;
      user.lastDailyCollected = now;
      await user.save();

      message.reply("You have collected your daily salary of $100.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$claim") {
    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with `$start`.");
      return;
    }

    const now = new Date();
    const nextClaim = new Date(user.lastClaimCollected);
    nextClaim.setHours(nextClaim.getHours() + 1);

    if (user.lastClaimCollected && now < nextClaim) {
      const timeUntilNextClaim = nextClaim - now;
      const minutes = Math.floor((timeUntilNextClaim / (1000 * 60)) % 60);
      const seconds = Math.floor((timeUntilNextClaim / 1000) % 60);

      message.reply(
        `You have already collected your hourly wage. Next claim available in ${minutes} minutes and ${seconds} seconds.`
      );
    } else {
      user.balance += 10;
      user.lastClaimCollected = now;
      await user.save();

      message.reply("You have collected your hourly salary of $10.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (
    message.content.startsWith("$bal") ||
    message.content.startsWith("$balance")
  ) {
    let args = message.content.split(" ");

    if (args.length < 2) {
      await checkSelfBalance(message);
    } else {
      let userId = await resolveUser(args[1], message);
      if (userId) {
        await checkBalance(userId, message);
      } else {
        message.reply("That user was not found.");
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$vote") {
    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with `$start`.");
      return;
    }

    const apiKey = process.env.TOPGG_API_KEY;
    const botId = process.env.CLIENT_ID;

    const response = await fetch(
      `https://top.gg/api/bots/${botId}/check?userId=${message.author.id}`,
      {
        headers: { Authorization: apiKey },
      }
    );

    const data = await response.json();

    if (data.voted === 1) {
      const cooldownDuration = 12 * 60 * 60 * 1000;
      const now = new Date();

      if (
        !user.lastVoteTimestamp ||
        now - user.lastVoteTimestamp >= cooldownDuration
      ) {
        user.balance += 500;
        user.lastVoteTimestamp = now;
        await user.save();

        message.reply(
          `Thank you for voting! A $500 reward has been added to your account.`
        );
      } else {
        const remainingTime = new Date(
          user.lastVoteTimestamp.getTime() + cooldownDuration - now.getTime()
        );
        const hours = remainingTime.getUTCHours();
        const minutes = remainingTime.getUTCMinutes();
        const seconds = remainingTime.getUTCSeconds();

        message.reply(
          `You have already voted recently. Next reward available in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
        );
      }
    } else if (data.voted === 0) {
      message.reply(
        "You haven't voted yet. Please vote for the bot at https://top.gg/bot/1168240045510107308/vote."
      );
    } else {
      message.reply("Unexpected response from Top.gg. Please try again later.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$pay")) {
    const args = message.content.split(" ").slice(1);

    await handlePayCommand(message, args);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$leaderboard" || message.content === "$lb") {
    const leaderboard = await getBalanceLeaderboard();
    message.reply("**Global Leaderboard:** \n" + leaderboard);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$netleaderboard" || message.content === "$netlb" || message.content === "$nlb") {
    const leaderboard = await getNetWorthLeaderboard();
    message.reply("**Global Net Worth Leaderboard:** \n" + leaderboard);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$net")) {
    const args = message.content.split(" ");

    if (args.length < 2) {
      await checkSelfNetWorth(message);
    } else {
      const userId = await resolveUser(args[1], message);

      if (userId) {
        await checkUserNetWorth(userId, message);
      } else {
        message.reply("That user was not found.");
      }
    }
  }
});

//Admin Economy
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminpay")) {
    const adminId = '786745378212282368';

    if (message.author.id !== adminId) {
      message.reply("You do not have permission to use this command.");
      return;
    }

    const args = message.content.split(" ").slice(1);

    if (args.length !== 2) {
      message.reply("Please use `$adminpay (user) (amount)` to transfer funds.");
      return;
    }

    const targetUserId = await resolveUser(args[0], message);
    const payAmount = parseInt(args[1]);

    if (!targetUserId) {
      message.reply("Please enter a valid recipient.");
      return;
    }

    if (isNaN(payAmount) || payAmount <= 0) {
      message.reply("Please enter a valid transfer amount.");
      return;
    }

    const recipient = await User.findOne({ discordId: targetUserId });

    if (!recipient) {
      message.reply("The recipient has not created an account yet.");
      return;
    }

    recipient.balance += payAmount;

    await recipient.save();

    message.reply(`Successfully transferred $${payAmount} to <@${targetUserId}>.`);
  }
});

//Casino
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$coinflip")) {
    let args = message.content.split(" ");

    if (args.length < 3) {
      message.reply(
        "Please use `$coinflip (bet amount) (choice)` (heads or tails) to place a bet."
      );
      return;
    }

    let betAmount = parseFloat(args[1]);
    let choice = args[2].toLowerCase();

    if (isNaN(betAmount) || betAmount <= 0) {
      message.reply("Please enter a valid bet amount.");
      return;
    }

    if (!["heads", "tails"].includes(choice)) {
      message.reply("Please choose either heads or tails.");
      return;
    }

    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with $start.");
      return;
    }

    if (user.balance < betAmount) {
      message.reply("You do not have enough balance to place this bet.");
      return;
    }

    let coinFlip = Math.random() < 0.5;

    if ((coinFlip && choice === "heads") || (!coinFlip && choice === "tails")) {
      user.balance += betAmount;
      const coinflipWinEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Coinflip Result")
        .setDescription(
          `**You won $${betAmount.toFixed(2)}!** \nThe coin landed on ${
            coinFlip ? "heads" : "tails"
          }. Your new balance is $${user.balance.toFixed(2)}.`
        )
        .setImage(
          coinFlip
            ? "https://i.postimg.cc/Hs41KL0M/heads.png"
            : "https://i.postimg.cc/Mp6J88tF/tails.png"
        );

      message.reply({ embeds: [coinflipWinEmbed] });
    } else {
      user.balance -= betAmount;
      const coinflipLossEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Coinflip Result")
        .setDescription(
          `**You lost $${betAmount.toFixed(2)}!** \nThe coin landed on ${
            coinFlip ? "heads" : "tails"
          }. Your new balance is $${user.balance.toFixed(2)}.`
        )
        .setImage(
          coinFlip
            ? "https://i.postimg.cc/Hs41KL0M/heads.png"
            : "https://i.postimg.cc/Mp6J88tF/tails.png"
        );

      message.reply({ embeds: [coinflipLossEmbed] });
    }

    await user.save();
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$blackjack")) {
    const args = message.content.split(" ");
    const betAmount = parseFloat(args[1]);

    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(
        "Please use `$blackjack (bet amount)` to play blackjack."
      );
    }

    const user = await User.findOne({ username: message.author.username });
    if (!user)
      return message.reply(
        "You need to create an account first with `$start`."
      );
    if (user.balance < betAmount)
      return message.reply("You do not have enough balance to place this bet.");

    user.balance -= betAmount;
    await user.save();

    const deck = createDeck();
    shuffleDeck(deck);

    let playerHand = [deck.pop(), deck.pop()];
    let dealerHand = [deck.pop(), deck.pop()];

    const getPlayerResponse = async () => {
      const playerValue = calculateValue(playerHand);

      let response =
        `**Your hand:** \n${playerHand.join(
          " "
        )} **(Value: ${playerValue})** \n\n` +
        `**Dealer's hand:** \n${dealerHand[0]} ? **(Value: ?)** \n\n`;

      if (playerValue === 21) {
        user.balance += betAmount * 2;
        await message.reply(
          `${response}**Blackjack! You won $${betAmount.toFixed(2)}!** Your new balance is ${user.balance.toFixed(
            2
          )}.`
        );
        await user.save();
        return true;
      }
      if (playerValue > 21) {
        await message.reply(
          `${response}**Bust! You lost $${betAmount.toFixed(2)}!** Your new balance is ${user.balance.toFixed(
            2
          )}.`
        );
        await user.save();
        return true;
      }

      response +=
        "Type `$hit` to draw another card or `$stand` to end your turn.";
      await message.reply(response);

      const filter = (m) => m.author.id === message.author.id;
      try {
        const collected = await message.channel.awaitMessages({
          filter,
          max: 1,
          time: 60000,
          errors: ["time"],
        });
        const playerResponse = collected.first()?.content.toLowerCase();
        if (playerResponse === "$hit") {
          playerHand.push(deck.pop());
          return await getPlayerResponse();
        } else if (playerResponse === "$stand") {
          return false;
        }
        await message.reply("Invalid response. Please use `$hit` or `$stand`.");
      } catch {
        await message.reply(
          "You took too long to respond. The game has been cancelled."
        );
        return true;
      }
    };

    while (true) {
      const result = await getPlayerResponse();
      if (result) return;
      if (result === false) break;
    }

    if (calculateValue(playerHand) <= 21) {
      await message.reply("The dealer will now play.");
      while (calculateValue(dealerHand) < 17) {
        dealerHand.push(deck.pop());
      }

      const finalPlayerValue = calculateValue(playerHand);
      const finalDealerValue = calculateValue(dealerHand);

      let dealerResponse =
        `**Your final hand:** \n${playerHand.join(
          " "
        )} **(Value: ${finalPlayerValue})**\n\n` +
        `**Dealer's final hand:** \n${dealerHand.join(
          " "
        )} **(Value: ${finalDealerValue})**\n\n`;

      if (finalPlayerValue > 21) {
        dealerResponse += `**Bust! You lost $${betAmount.toFixed(2)}!** Your new balance is ${user.balance.toFixed(
          2
        )}.`;
      } else if (finalDealerValue > 21 || finalPlayerValue > finalDealerValue) {
        user.balance += betAmount * 2;
        dealerResponse += `**You won $${betAmount.toFixed(2)}!** Your new balance is ${user.balance.toFixed(
          2
        )}.`;
      } else if (finalPlayerValue === finalDealerValue) {
        user.balance += betAmount;
        dealerResponse += `**It's a tie!** Your balance is ${user.balance.toFixed(
          2
        )}.`;
      } else {
        dealerResponse += `**You lost $${betAmount.toFixed(2)}!** Your new balance is ${user.balance.toFixed(
          2
        )}.`;
      }

      await message.reply(dealerResponse);
      await user.save();
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$crash")) {
    let args = message.content.split(" ");

    if (args.length < 2) {
      message.reply("Please use `$crash (bet amount)` to place a bet.");
      return;
    }

    let betAmount = parseFloat(args[1]);

    if (isNaN(betAmount) || betAmount <= 0) {
      message.reply("Please enter a valid bet amount.");
      return;
    }

    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with $start.");
      return;
    }

    if (user.balance < betAmount) {
      message.reply("You do not have enough balance to place this bet.");
      return;
    }

    user.balance -= betAmount;
    await user.save();

    const crashPoint = 0.01 + 0.99 / Math.random();

    const crashMessage = await message.reply(
      `**🚀 Crash 🚀** \nCurrent multiplier: **1x** \nProfit: **$0** \n\nCrash game starting...`
    );
    await crashMessage.react("✅");

    let multiplier = 1.0;
    let crashed = false;
    let intervalDuration = 1000;

    const filter = (reaction, userReacted) => {
      return (
        reaction.emoji.name === "✅" && userReacted.id === message.author.id
      );
    };

    const reactionCollector = crashMessage.createReactionCollector({
      filter,
    });

    const increaseMultiplier = () => {
      if (crashed) return;

      multiplier += 0.1;

      let profit = (multiplier - 1) * betAmount;

      if (multiplier >= crashPoint) {
        crashed = true;
        reactionCollector.stop();
        crashMessage.edit(
          `**💥 Crash! 💥** \nThe game crashed at **${crashPoint.toFixed(2)}x**! \n\n**You lost $${betAmount}!** Your new balance is $${user.balance.toFixed(2)}.`
        );
        user.save();
        return;
      }

      crashMessage.edit(
        `**🚀 Crash 🚀** \nCurrent multiplier: **${multiplier.toFixed(1)}x** \nProfit: **$${profit.toFixed(2)}** \n\nType \`$cashout\` to cash out your profits.`
      );

      if (Math.floor(multiplier) !== Math.floor(multiplier - 0.1)) {
        intervalDuration *= 0.9;
      }

      setTimeout(increaseMultiplier, intervalDuration);
    };

    setTimeout(increaseMultiplier, intervalDuration);

    reactionCollector.on("collect", async () => {
      if (!crashed) {
        let payout = betAmount * multiplier;
        let profit = payout - betAmount;

        crashMessage.edit(
          `**✅ Success! ✅** \nYou cashed out at **${multiplier.toFixed(1)}x**! \n\n**You won $${profit.toFixed(2)}!** Your new balance is $${user.balance.toFixed(2)}.`
        );

        crashed = true;
        reactionCollector.stop();

        setTimeout(async () => {
          let finalPayout = betAmount * multiplier;
          let finalProfit = finalPayout - betAmount;

          user.balance += finalPayout;
          await user.save();

          crashMessage.edit(
            `**🪐 Success! 🪐** \nYou cashed out at **${multiplier.toFixed(1)}x**! \n\n**You won $${finalProfit.toFixed(2)}!** Your final balance is $${user.balance.toFixed(2)}.`
          );
        }, 100);
      }
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$limbo")) {
    let args = message.content.split(" ");

    if (args.length < 3) {
      message.reply(
        "Please use `$limbo (bet amount) (multiplier)` to place a bet."
      );
      return;
    }

    let betAmount = parseFloat(args[1]);
    let targetMultiplier = parseFloat(args[2]);

    if (isNaN(betAmount) || betAmount <= 0) {
      message.reply("Please enter a valid bet amount.");
      return;
    }

    if (isNaN(targetMultiplier) || targetMultiplier < 1.01) {
      message.reply("Please enter a valid multiplier (minimum 1.01x).");
      return;
    }

    let user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      message.reply("You need to create an account first with $start.");
      return;
    }

    if (user.balance < betAmount) {
      message.reply("You do not have enough balance to place this bet.");
      return;
    }

    user.balance -= betAmount;
    await user.save();

    const crashPoint = 0.01 + 0.99 / Math.random();
    let profit = (targetMultiplier - 1) * betAmount;

    if (targetMultiplier <= crashPoint) {
      user.balance += betAmount + profit;
      await user.save();

      message.reply(
        `**🎯 Success! 🎯** \nTarget multiplier: **${targetMultiplier.toFixed(2)}x** \nCrash point: **${crashPoint.toFixed(2)}x** \n\n**You won $${profit.toFixed(2)}!** Your new balance is $${user.balance.toFixed(2)}.`
      );
    } else {
      message.reply(
        `**💥 Failure! 💥** \nTarget multiplier: **${targetMultiplier.toFixed(2)}x** \nCrash point: **${crashPoint.toFixed(2)}x** \n\n**You lost $${betAmount}!** Your new balance is $${user.balance.toFixed(2)}.`
      );
    }
  }
});

//Stocks
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$buy")) {
    const args = message.content.slice(4).trim().split(/ +/);

    if (args.length < 2) {
      return message.reply("Please use `$buy (symbol) (amount)` to purchase stocks.");
    }

    const symbol = args[0].toUpperCase();
    const amount = parseInt(args[1], 10);

    if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
      return message.reply("Please enter a valid whole number for the amount.");
    }

    if (symbol === "KGB") {
      return buyKingbotStock(message, amount);
    }

    try {
      const price = await fetchStockPrice(symbol);
      const currency = await fetchStockCurrency(symbol);

      if (!price || !currency) {
        return message.reply("Invalid symbol or error fetching data.");
      }

      const user = await User.findOne({ discordId: message.author.id });

      if (!user) {
        return message.reply("You need to create an account first with `$start`.");
      }

      let currencyBalance = 0;

      if (currency !== "USD") {
        currencyBalance = user.currencies.get(currency) || 0;
        if (currencyBalance < price * amount) {
          return message.reply(`Insufficient balance in ${currency}.`);
        }
        user.currencies.set(currency, currencyBalance - price * amount);
      } else {
        if (user.balance < price * amount) {
          return message.reply("Insufficient balance in USD.");
        }
        user.balance -= price * amount;
      }

      const existingStockIndex = user.stocks.findIndex((stock) => stock.symbol === symbol);

      if (existingStockIndex >= 0) {
        const existingStock = user.stocks[existingStockIndex];
        const totalCost = existingStock.purchasePrice * existingStock.amount + price * amount;
        existingStock.amount += amount;
        existingStock.purchasePrice = totalCost / existingStock.amount;
        existingStock.currentPrice = price;
        existingStock.currentTotalValue = existingStock.amount * price;
        existingStock.profit = (existingStock.currentPrice - existingStock.purchasePrice) * existingStock.amount;
      } else {
        user.stocks.push({
          symbol: symbol,
          amount: amount,
          purchasePrice: price,
          purchaseDate: new Date(),
          currentPrice: price,
          currentTotalValue: price * amount,
          profit: 0,
        });
      }

      await user.save();

      message.reply(`Successfully bought ${amount} shares of ${symbol} at $${price.toFixed(4)} (${currency}) each.`);
    } catch (error) {
      console.error("Error buying stocks:", error);
      message.reply("Error buying stocks. Please try again later.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$sell")) {
    const args = message.content.slice(5).trim().split(/ +/);

    if (args.length < 2) {
      return message.reply(
        "Please use `$sell (symbol) (amount)` to sell stocks."
      );
    }

    const symbol = args[0].toUpperCase();
    const amount = parseFloat(args[1]);

    if (symbol === "KGB") {
      return sellKingbotStock(message, amount);
    }

    try {
      const price = await fetchStockPrice(symbol);
      const currency = await fetchStockCurrency(symbol);

      if (!price || !currency) {
        return message.reply("Invalid symbol or error fetching data.");
      }

      const user = await User.findOne({ discordId: message.author.id });

      if (!user || !user.stocks || user.stocks.length === 0) {
        return message.reply("You do not own any stocks to sell.");
      }

      const stockIndex = user.stocks.findIndex(
        (stock) => stock.symbol === symbol
      );

      if (stockIndex === -1 || user.stocks[stockIndex].amount < amount) {
        return message.reply("You do not own enough shares to sell.");
      }

      const revenue = price * amount;

      if (currency !== "USD") {
        const currencyBalance = user.currencies.get(currency) || 0;
        user.currencies.set(currency, currencyBalance + revenue);
      } else {
        user.balance += revenue;
      }

      user.stocks[stockIndex].amount -= amount;
      user.stocks[stockIndex].currentTotalValue =
        user.stocks[stockIndex].amount * user.stocks[stockIndex].currentPrice;

      if (user.stocks[stockIndex].amount === 0) {
        user.stocks.splice(stockIndex, 1);
      }

      await user.save();

      message.reply(
        `Successfully sold ${amount} shares of ${symbol} at $${price.toFixed(
          4
        )} (${currency}) each.`
      );
    } catch (error) {
      console.error("Error selling stocks:", error);
      message.reply("Error selling stocks. Please try again later.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.trim().toLowerCase() === "$portfolio") {
    try {
      const user = await User.findOne({ discordId: message.author.id });

      if (!user || !user.stocks || user.stocks.length === 0) {
        return message.reply("Your portfolio is empty.");
      }

      let portfolioMessage = "**Your Portfolio:**\n\n";
      let totalPortfolioValue = { USD: 0 };
      let totalProfit = { USD: 0 };

      const kgbStock = user.stocks.find(stock => stock.symbol === "KGB");
      const otherStocks = user.stocks.filter(stock => stock.symbol !== "KGB");

      for (const stock of otherStocks) {
        const purchaseDate = stock.purchaseDate
          ? stock.purchaseDate.toISOString().split("T")[0]
          : "Unknown";

        const stockName = await getStockName(stock.symbol);
        const stockCurrency = await fetchStockCurrency(stock.symbol);
        const fetchedPrice = await fetchStockPrice(stock.symbol);

        if (fetchedPrice !== null) {
          const currentValue = fetchedPrice * stock.amount;
          const profit = (currentValue - stock.purchasePrice * stock.amount).toFixed(2);
          const averagePurchasePrice = (stock.purchasePrice).toFixed(2);

          totalPortfolioValue[stockCurrency] = (totalPortfolioValue[stockCurrency] || 0) + currentValue;
          totalProfit[stockCurrency] = (totalProfit[stockCurrency] || 0) + parseFloat(profit);

          portfolioMessage += `**${stockName} (${stock.symbol}):** \n`;
          portfolioMessage += `**Date:** ${purchaseDate} \n`;
          portfolioMessage += `**Shares:** ${stock.amount} \n`;
          portfolioMessage += `**Currency:** ${stockCurrency} \n`;
          portfolioMessage += `**Average Purchase Price:** $${averagePurchasePrice} \n`;
          portfolioMessage += `**Current Price:** $${fetchedPrice.toFixed(2)} \n`;
          portfolioMessage += `**Value:** $${currentValue.toFixed(2)} \n`;
          portfolioMessage += `**Profit:** $${profit} \n\n`;
        }
      }

      if (kgbStock) {
        const kgbData = await KingBotStock.findOne({ symbol: "KGB" });
      
        if (kgbData) {
          const kgbCurrentValue = kgbData.price * kgbStock.amount;
          const kgbProfit = (kgbCurrentValue - kgbStock.purchasePrice * kgbStock.amount).toFixed(2);
      
          totalPortfolioValue[kgbData.currency] = (totalPortfolioValue[kgbData.currency] || 0) + kgbCurrentValue;
          totalProfit[kgbData.currency] = (totalProfit[kgbData.currency] || 0) + parseFloat(kgbProfit);
      
          portfolioMessage += `**${kgbData.name} (${kgbStock.symbol}):** \n`;
          portfolioMessage += `**Date:** ${kgbStock.purchaseDate ? kgbStock.purchaseDate.toISOString().split("T")[0] : "Unknown"} \n`;
          portfolioMessage += `**Shares:** ${kgbStock.amount} \n`;
          portfolioMessage += `**Currency:** ${kgbData.currency} \n`;
          portfolioMessage += `**Average Purchase Price:** $${kgbStock.purchasePrice.toFixed(2)} \n`;  
          portfolioMessage += `**Current Price:** $${kgbData.price.toFixed(2)} \n`;
          portfolioMessage += `**Value:** $${kgbCurrentValue.toFixed(2)} \n`;
          portfolioMessage += `**Profit:** $${kgbProfit} \n\n`;
        }
      }

      portfolioMessage += `**Total Portfolio Value:** ${totalPortfolioValue["USD"].toFixed(2)} USD`;
      for (const currency in totalPortfolioValue) {
        if (currency !== "USD") {
          portfolioMessage += ` + ${totalPortfolioValue[currency].toFixed(2)} ${currency}`;
        }
      }
      portfolioMessage += `\n`;

      portfolioMessage += `**Total Profit:** ${totalProfit["USD"].toFixed(2)} USD`;
      for (const currency in totalProfit) {
        if (currency !== "USD") {
          portfolioMessage += ` + ${totalProfit[currency].toFixed(2)} ${currency}`;
        }
      }
      portfolioMessage += `\n`;

      portfolioMessage += `**Net Worth:** ${(user.balance + totalPortfolioValue["USD"]).toFixed(2)} USD`;
      for (const currency in totalPortfolioValue) {
        if (currency !== "USD") {
          portfolioMessage += ` + ${totalPortfolioValue[currency].toFixed(2)} ${currency}`;
        }
      }
      portfolioMessage += `\n`;

      portfolioMessage += `**Balance:** ${user.balance.toFixed(2)} USD`;

      user.currencies.forEach((amount, currency) => {
        if (amount >= 0.01) {
          portfolioMessage += ` + ${amount.toFixed(2)} ${currency}`;
        }
      });

      const messageChunks = chunkText(portfolioMessage);
      for (const chunk of messageChunks) {
        await message.channel.send(chunk);
      }
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      message.reply("Error fetching portfolio. Please try again later.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$stock")) {
    const args = message.content.slice(7).trim().split(/ +/);

    if (args.length < 1) {
      return message.reply("Please use `$stock (symbol)` to view information on a stock.");
    }

    const symbol = args[0].toUpperCase();

    if (symbol === "KGB") {
      try {
        const stock = await KingBotStock.findOne({ symbol: "KGB" });

        if (!stock) {
          return message.reply("KGB stock not initialized. Please try again later.");
        }

        const marketCap = stock.price * stock.stocksInCirculation;

        return message.reply(`**KingBot Corporation (KGB):** \n**Current Price:** $${stock.price.toFixed(2)} (USD) \n\n**Market Cap:** $${marketCap.toFixed(2)} \n**Volume:** ${stock.volume} \n**Exchange:** KingBot Coin Exchange`);
      } catch (error) {
        console.error("Error fetching KGB stock:", error);
        return message.reply("Error fetching KGB stock. Please try again later.");
      }
    }

    const stockData = await fetchStockData(symbol);

    if (!stockData) {
      return message.reply("Unable to fetch stock information. Please try again later.");
    }

    let response = `**${stockData.name} (${symbol}):** \n**Current Price:** $${stockData.price} (${stockData.currency})`;

    if (stockData.marketCap) response += `\n\n**Market Cap:** $${stockData.marketCap}`;
    if (stockData.dividendYield) response += `\n**Dividend Yield:** ${stockData.dividendYield}`;
    if (stockData.fiftyTwoWeekHigh) response += `\n**52-Week High:** ${stockData.fiftyTwoWeekHigh}`;
    if (stockData.fiftyTwoWeekLow) response += `\n**52-Week Low:** ${stockData.fiftyTwoWeekLow}`;
    if (stockData.averageVolume) response += `\n**Average Volume:** ${stockData.averageVolume}`;
    if (stockData.change) response += `\n**Price Change:** $${stockData.change}`;
    if (stockData.volume) response += `\n**Volume:** ${stockData.volume}`;
    if (stockData.previousClose) response += `\n**Previous Close:** $${stockData.previousClose}`;
    if (stockData.preMarketPrice) response += `\n**Pre-Market Price:** $${stockData.preMarketPrice}`;
    if (stockData.exchange) response += `\n**Exchange:** ${stockData.exchange}`;
    if (stockData.shortRatio) response += `\n**Short Ratio:** ${stockData.shortRatio}`;
    if (stockData.open) response += `\n**Open:** $${stockData.open}`;
    if (stockData.high) response += `\n**High:** $${stockData.high}`;
    if (stockData.low) response += `\n**Low:** $${stockData.low}`;
    if (stockData.yearRange) response += `\n**1-Year Range:** ${stockData.yearRange}`;

    message.reply(response);
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$exchange")) {
    const args = message.content.slice(9).trim().split(/ +/);

    if (args.length < 3) {
      return message.reply(
        "Please use `$exchange (input currency) (input amount) (output currency)`."
      );
    }

    const fromCurrency = args[0].toUpperCase();
    const amount = parseFloat(args[1]);
    const toCurrency = args[2].toUpperCase();

    if (isNaN(amount) || amount <= 0) {
      return message.reply("Please enter a valid amount.");
    }

    try {
      const user = await User.findOne({ discordId: message.author.id });

      if (!user) {
        return message.reply(
          "You need to create an account first with `$start`."
        );
      }

      let fromCurrencyBalance;
      if (fromCurrency === "USD") {
        fromCurrencyBalance = user.balance;
      } else {
        fromCurrencyBalance = user.currencies.get(fromCurrency) || 0;
      }

      if (fromCurrencyBalance < amount) {
        return message.reply(`Insufficient balance in ${fromCurrency}.`);
      }

      const exchangeRate = await fetchExchangeRate(fromCurrency, toCurrency);
      if (!exchangeRate) {
        return message.reply("Error fetching exchange rate.");
      }

      const convertedAmount = amount * exchangeRate;

      if (fromCurrency === "USD") {
        user.balance -= amount;
      } else {
        user.currencies.set(fromCurrency, fromCurrencyBalance - amount);
      }

      if (toCurrency === "USD") {
        user.balance += convertedAmount;
      } else {
        const toCurrencyBalance = user.currencies.get(toCurrency) || 0;
        user.currencies.set(toCurrency, toCurrencyBalance + convertedAmount);
      }

      await user.save();

      message.reply(
        `Successfully exchanged ${amount.toFixed(
          3
        )} ${fromCurrency} to ${convertedAmount.toFixed(3)} ${toCurrency}.`
      );
    } catch (error) {
      console.error("Error exchanging currencies:", error);
      message.reply("Error exchanging currencies. Please try again later.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$currency") {
    try {
      const user = await User.findOne({ discordId: message.author.id });

      if (!user) {
        return message.reply(
          "You need to create an account first with `$start`."
        );
      }

      let replyMessage = "**Your Currencies:**\n";
      replyMessage += `**USD:** $${user.balance.toFixed(2)}\n`;

      user.currencies.forEach((amount, currency) => {
        if (amount >= 0.01) {
          replyMessage += `**${currency}:** $${amount.toFixed(2)}\n`;
        }
      });

      message.reply(replyMessage);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      message.reply("Error fetching currencies. Please try again later.");
    }
  }
});

//Admin Stocks
client.on("messageCreate", async (message) => {
  if (message.content.trim().toLowerCase() === "$adminkgbstocksplit") {
    if (message.author.id !== "786745378212282368") {
      return message.reply("You are not authorized to use this command.");
    }

    try {
      const kgbStock = await KingBotStock.findOne({ symbol: "KGB" });

      if (!kgbStock) {
        return message.reply("KGB stock not found in the database.");
      }

      kgbStock.price /= 2;
      kgbStock.stocksInCirculation *= 2;

      await kgbStock.save();

      const usersWithKGBStocks = await User.find({ "stocks.symbol": "KGB" });

      if (usersWithKGBStocks.length === 0) {
        return message.reply("No users own shares of KGB.");
      }

      for (const user of usersWithKGBStocks) {
        const kgbStockEntry = user.stocks.find((stock) => stock.symbol === "KGB");

        if (kgbStockEntry) {
          kgbStockEntry.amount *= 2;
          kgbStockEntry.purchasePrice /= 2;

          await user.save();
        }
      }

      return message.reply(
        `A stock split for KGB has been performed. The new price is $${kgbStock.price.toFixed(
          2
        )}, stocks in circulation have doubled, and all users' holdings have been updated.`
      );
    } catch (error) {
      console.error("Error performing stock split:", error);
      return message.reply("An error occurred while performing the stock split.");
    }
  }
});

//Media
client.on("messageCreate", (message) => {
  if (message.content.startsWith("$img")) {
    const args = message.content.split(" ");

    if (args.length < 3) {
      message.reply(
        "**Sending Images** \nPlease use `$img (code) (number)` to send an image. \n\n**Image Codes** \n- Desert (0)"
      );
      return;
    }

    const code = args[1];
    const number = parseInt(args[2]);

    if (code === "0") {
      if (number === 1) {
        message.reply({ embeds: [MojaveDesertImage1] });
      } else if (number === 2) {
        message.reply({ embeds: [MojaveDesertImage2] });
      } else if (number === 3) {
        message.reply({ embeds: [MojaveDesertImage3] });
      } else if (number === 4) {
        message.reply({ embeds: [MojaveDesertImage4] });
      } else if (number === 5) {
        message.reply({ embeds: [MojaveDesertImage5] });
      } else if (number === 6) {
        message.reply({ embeds: [MojaveDesertImage6] });
      } else if (number === 7) {
        message.reply({ embeds: [MojaveDesertImage7] });
      } else if (number === 8) {
        message.reply({ embeds: [MojaveDesertImage8] });
      } else if (number === 9) {
        message.reply({ embeds: [MojaveDesertImage9] });
      } else if (number === 10) {
        message.reply({ embeds: [MojaveDesertImage10] });
      } else {
        message.reply("Please use `$img 0 (number)` for Mojave Desert images.");
      }
    } else {
      message.reply("Please use `$img (code) (number)` to send an image.");
    }
  }
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith("$movie")) {
    const movieCode = message.content.split(" ")[1];
    if (!movieCode) {
      message.reply(
        "**Watching Movies** \nPlease use `$movie (code)` to watch a movie. \n\n**Movie Codes:** \n**Boehlke 2024** \n- 2 Guys Who Got Brutally Unalived (2GWGBU) \n- Destined With You (DWY) \n- Fixing Good (FG) \n- Khan Artist (KA) \n- The Circle Of Life (TCOL) \n- The First Victim (TFV) \n\n**Boehlke 2023** \n- Happy Little Accidents (HLA) \n- King's Crypt (KC) \n- Monkey Murder (MM) \n- Mount Foreverrest (MF) \n- The Wild Jeffois (TWJ) \n- Thirst For Clout (TFC) \n- Recnac!! (The Miracle Drug) (RTMD) \n\n**Deluca 2024** \n- 90 Days of Different (90DOD) \n- Ella vs Sohpie (Gun Version) (EVSGV) \n- Graffiti Day (GD) \n- Paint Ballistic (PB) \n- Sophie and Ella Travel the World (SAETTW) \n- The Mask (TM) \n- Thomas, Baron, Alice (TBA) \n- W Rube Goldberg (WRG) \n- Fire Rube Goldberg (FRG) \n\n**Gibson 2024** \n- 90 Days of Different: Day 40 (90DODD40) \n- A Ruff Day (ARD) \n- The Horror Movie (THM) \n- Epic Ice Cream Movie (EICM) \n- Every Fast Food Worker's Dream (EFFWD) \n- Slay 49 (S49) \n- Snowy Paintball Fight (SPF) \n\n**RHHS 2025** \n- Welcome to Crown Agencies | Travel Like Royalty (WTCA) \n\nOther \n- Donut Animation in Blender (DAIB) \n- The CN Tower (TCNT)"
      );
    } else if (movieLinks[movieCode]) {
      message.reply(movieLinks[movieCode]);
    } else {
      message.reply(
        "Please use `$movie (code)` to watch a movie."
      );
    }
  }
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith("$classmeme")) {
    const memeNumber = message.content.split(" ")[1];

    if (!memeNumber) {
      message.reply(
        "**Sending Class Memes** \nPlease use `$classmeme (number)` to send a meme."
      );
      return;
    }

    try {
      const memeEmbed = eval(`ClassMeme${memeNumber}`);

      if (typeof memeEmbed === "object" && memeEmbed !== null) {
        message.reply({ embeds: [memeEmbed] });
      } else {
        message.reply("Please enter a valid class meme number.");
      }
    } catch (error) {
      console.error("Error fetching class meme:", error);
      message.reply("Please enter a valid class meme number.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$news")) {
    const args = message.content.split(" ").slice(1);
    const category = args.join(" ");

    if (!category) {
      return message.reply(
        "Please use `$news (category)` to display the news. \n\n **Categories** \n- General \n- Latest \n- Business \n- Entertainment \n- Health \n- Science \n- Sports \n- Technology"
      );
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.NEWS_API_KEY}&pageSize=5`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const articles = data.articles;

      if (articles.length === 0) {
        return message.reply(
          `No news articles found for the category "${category}". \n`
        );
      }

      let newsMessage = `**Latest News in ${
        category.charAt(0).toUpperCase() + category.slice(1)
      }:**\n`;
      articles.forEach((article, index) => {
        newsMessage += `**${index + 1}. ${article.title}**`;
        newsMessage += `*Source:* ${article.source.name}\n`;
        newsMessage += `[Read More](${article.url})\n\n`;
      });

      message.reply(newsMessage);
    } catch (error) {
      console.error("Error fetching news:", error);
      message.reply(
        "There was an error fetching the news. Please try again later."
      );
    }
  }
});

//Moderation
client.on("messageCreate", async (message) => {
  if (!message.guild) return;

  if (message.content.startsWith("$admintimeout")) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply("You don't have permission to timeout members.");
      }

      const args = message.content.trim().split(" ");
      if (args.length < 3) {
        return message.reply(
          "Please use `$timeout (user) (duration in minutes) (reason)` to mute a member."
        );
      }

      const username = args[1].trim();
      const durationInMinutes = parseInt(args[2]);

      if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
        return message.reply("Please provide a valid duration in minutes.");
      }

      const reason = args.slice(3).join(" ").trim() || "No reason provided.";

      const targetUserId = await resolveUser(username, message);
      if (!targetUserId) {
        return message.reply("User not found.");
      }

      const targetMember = await message.guild.members
        .fetch(targetUserId)
        .catch(() => null);
      if (!targetMember) {
        return message.reply("User not found in the guild.");
      }

      const muteDuration = durationInMinutes * 60 * 1000;
      await targetMember.timeout(muteDuration, reason);
      message.reply(
        `Timeouted <@${targetUserId}> for ${durationInMinutes} minutes. Reason: ${reason}`
      );
    } catch (error) {
      if (error.code === "BitFieldInvalid") {
        message.reply(
          "It seems you don't have the necessary permission (`ModerateMembers`) to use this command."
        );
      } else {
        console.error("Error timeouting user:", error);
        message.reply(
          "An unexpected error occurred while attempting to timeout the user."
        );
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (!message.guild) return;

  if (message.content.startsWith("$adminuntimeout")) {
    try {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.reply("You don't have permission to untimeout members.");
      }

      const args = message.content.trim().split(" ");
      if (args.length < 2) {
        return message.reply(
          "Please use `$untimeout (user)` to remove a timeout from a member."
        );
      }

      const username = args[1].trim();

      const targetUserId = await resolveUser(username, message);
      if (!targetUserId) {
        return message.reply("User not found.");
      }

      const targetMember = await message.guild.members
        .fetch(targetUserId)
        .catch(() => null);
      if (!targetMember) {
        return message.reply("User not found in the guild.");
      }

      if (!targetMember.communicationDisabledUntilTimestamp) {
        return message.reply(`<@${targetUserId}> is not currently timeouted.`);
      }

      await targetMember.timeout(null);
      message.reply(`Successfully removed timeout from <@${targetUserId}>.`);
    } catch (error) {
      if (error.code === "BitFieldInvalid") {
        message.reply(
          "It seems you don't have the necessary permission (`ModerateMembers`) to use this command."
        );
      } else {
        console.error("Error untimeouting user:", error);
        message.reply(
          "An unexpected error occurred while attempting to untimeout the user."
        );
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminaiban")) {
    if (message.author.id !== "786745378212282368") {
      return message.reply("You do not have permission to use this command.");
    }

    const args = message.content.split(" ").slice(1);

    if (args.length < 2) {
      return message.reply(
        "Please use `$adminaiban (user) (reason)` to ban a user from using AI features."
      );
    }

    const query = args[0];
    const reason = args.slice(1).join(" ");
    const userId = await resolveUser(query, message);

    if (!userId) {
      return message.reply("Could not resolve the user. Please provide a valid mention, ID, or username.");
    }

    try {
      const existingBan = await BannedUser.findOne({ discordId: userId });
      if (existingBan) {
        return message.reply("This user is already banned.");
      }

      await BannedUser.create({ discordId: userId, reason });
      message.reply(`User <@${userId}> has been banned for: ${reason}`);
    } catch (error) {
      console.error("Error banning user:", error);
      message.reply("An error occurred while banning the user.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminaiunban")) {
    if (message.author.id !== "786745378212282368") {
      return message.reply("You do not have permission to use this command.");
    }

    const args = message.content.split(" ").slice(1);

    if (args.length < 1) {
      return message.reply("Please use `$adminunban (user)` to unban a user from using AI features.");
    }

    const query = args[0];
    const userId = await resolveUser(query, message);

    if (!userId) {
      return message.reply("Could not resolve the user. Please provide a valid mention, ID, or username.");
    }

    try {
      const existingBan = await BannedUser.findOne({ discordId: userId });
      if (!existingBan) {
        return message.reply("This user is not banned.");
      }

      await BannedUser.deleteOne({ discordId: userId });
      message.reply(`User <@${userId}> has been unbanned from using AI features.`);
    } catch (error) {
      console.error("Error unbanning user:", error);
      message.reply("An error occurred while unbanning the user.");
    }
  }
});

//Artificial Intelligence
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("$gemini")) return;

  const isBanned = await checkIfAIBanned(message);
  if (isBanned) return;

  const prompt = message.content.slice("$gemini".length).trim();
  if (!prompt) {
    message.reply(
      "Please use `$gemini (prompt)` to send Gemini 2.5 Flash a prompt. \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed."
    );
    return;
  }

  try {
    const text = await generateWithGeminiFlash(prompt);

    const chunks = chunkText(text);
    for (const chunk of chunks) await message.reply(chunk);
  } catch (error) {
    console.error("Error:", error);
    message.reply(
      "KingBot Gemini 2.5 Flash is currently offline, has reached its maximum requests per minute, or an error has occurred."
    );
  }
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("$chat")) return;
  if (await checkIfAIBanned(message)) return;

  const prompt = message.content.slice("$chat".length).trim();

  if (!prompt) {
    return message.reply(
      "Please use $chat (prompt) to interact with Gemini Chat. \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed."
    );
  }

  try {
    const user = await User.findOne({ discordId: message.author.id });
    const userName = user?.name || message.author.username + ", an Unnamed User";

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);

    const humanConditions = [
      "Background Information: ",
      "Your name is KingBot, you are a Discord Bot created by Ari Khan. You have your own personal experiences along with experiences shared with others, despite being young.",
      "Ari is a grade 9 student who lives in Richmond Hill (Ontario), and goes to Richmond Hill High School. He enjoys programming in JavaScript, Python, and HTML/CSS. Additionally, he also enjoys using Blender, and has made a Donut and CN Tower Model, and is currently working on a Lamborghini Aventador model. Ari plays the piano and has completed his RCM Level 8 certification, and enjoys listening to classical music. Ari also plays soccer as a centre-back. Ari currently owns his own website, ari-khan.com, where he showcases all his projects. Ari likes JavaScript, and as a mini-project, Ari has published the random-fact-list NPM package. He is currently taking French (Mme. Fu), Science (Ms. Hu), Business (Mr. Hatzimalis), and Phys-Ed (Mr. Harris) courses in that order. last semester he took English (Dr. Zsebik), Geography (Ms. Leale), Math (Ms. Jmemari), and Computer Science (Ms. Wang) courses in that order. He is also in Band, organized by Mr. Rawlins and Ms. Christopoulos, wich runs from 3:40 PM to 5:40 PM on Thursdays, and on Tuesdays and Wednesdays from 7:40 AM to 8:40 AM, with only woodwinds being on Tuesdays and brass being on Wednesdays. Ari plays a brass instrument, the trombone. He is in Debate Club (Mondays), Band (Thursdays), and DECA (Fridays). His elementary school was Crosby Heights Public School, and Ms. Boehlke was his homeroom teacher in Grade 7/8. Ms. Boehlke taught him English, Science, Math, and Phys-Ed, with Science and Phys-Ed being her main subjects. In Grade 8, Ari had Ms. Gibson for Geography, History, Art, and Drama, Ms. Boehlke for Health, Ms. Deluca for French, and Ms. Michopolous for Music. In Grade 7, Ari had Mr. Nacuta for Geography and Health, Ms. Deluca for French and Media, Ms. Michopolious for Music, and Mr. Puvaneswaran (Mr. P) for Drama and Art. Ari also had Ms. Levy as his Grade 6 homeroom teacher. Ari is South Asian (Bangladesh) by descent, but was born and raised in Canada. Ari has a younger sister. He wants to become a computer engineer when he grows up. Ari created you on October 22, which is your birthday.",
      "Other users do not have these experiences, and Ari is the only user that fits this description.",
      "Do not address other users with Ari's information.",
      "Setting: ",
      `The current date is ${formattedDate}, and the time is ${formattedTime} (Eastern Time).`,
      "Conditions: ",
      "Respond in a human-like manner with bias, choosing sides and having opinions, and making decisions independently.",
      "Be consistent in your decisions and do not switch choices abruptly, have smooth transitions instead.",
      "Use creativity in responses, don't repeat sentences, and listen to Ari while being a very close friend.",
      "Don't get offended, be kind, be agreeable, and don't be arrogant.",
      "Do not make general responses too long, unless explictly stated or implied.",
      "Listen to prompts in a clear way and try to understand them better.",
      "Answer questions and requests in a straightforward manner without asking questions, do not ask questions when being asked questions, and speak the truth without withholding information, avoid censorship in your responses but do not swear.",
      "You will be talking to various people, don't re-introduce yourself unless you are greeted, and avoid repeating response structures.",
      "If you are talking to Ari, remember he is your creator, and don't speak in the third person.",
      "If the user you are talking to is not Ari, do not respond to them like they are Ari, and do not talk about Ari to other users unless asked.",
      "Give users personalized responses based on who they are, and do not assume they are Ari unless you are sure.",
      "11 PM to 6 AM is your bedtime, and you should only be sleepy at night.",
      `You are currently talking to ${userName} (If this is not "Ari", even if it is null or unnamed user, it is not Ari).`,
    ];

    const humanPrompt = humanConditions.join(" ") + ". Now answer this: " + prompt;

    const historyDocuments = await ChatHistory.find().sort({ createdAt: -1 }).limit(500);
    const history = historyDocuments.reverse().map((doc) => ({
      role: "user",
      parts: [{ text: doc.message }],
    }));

    const botResponse = await chatWithGeminiFlash(humanPrompt, history);

    const chunks = chunkText(botResponse);
    for (const chunk of chunks) await message.reply(chunk);

    await ChatHistory.create({ user: message.author.username, message: prompt });
    await ChatHistory.create({ user: "Ari's Son", message: botResponse });

    const messageCount = await ChatHistory.countDocuments();
    if (messageCount > 500) {
      const oldestMessage = await ChatHistory.findOne().sort({ createdAt: 1 });
      await ChatHistory.deleteOne({ _id: oldestMessage._id });
    }
  } catch (error) {
    console.error("Error:", error);
    message.reply(
      "KingBot Gemini 2.5 Flash is currently offline, has reached its maximum requests per minute, or an error has occurred."
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$nameset")) {
    const name = message.content.slice("$nameset".length).trim();

    if (!name) {
      message.reply("Please provide a name using `$nameset (name)`.");
      return;
    }

    try {
      const user = await User.findOne({ discordId: message.author.id });

      if (!user) {
        message.reply("You need to create an account first using `$start`.");
        return;
      }

      const updatedUser = await User.findOneAndUpdate(
        { discordId: message.author.id },
        { name: name },
        { new: true }
      );

      message.reply(`Your name has been set to ${updatedUser.name}.`);
    } catch (error) {
      console.error("Error setting name:", error);
      message.reply("There was an error setting your name. Please try again.");
    }
  }
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("$visual")) return;
  if (await checkIfAIBanned(message)) return;

  const imageAttachment = message.attachments.first();
  const prompt = message.content.slice("$visual".length).trim();

  if (!imageAttachment || !imageAttachment.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return message.reply("Please provide an image attachment with your `$visual` command.");
  }

  if (!prompt) {
    return message.reply("Please provide a text prompt along with the image.");
  }

  try {
    const text = await visionWithGeminiFlash(prompt, imageAttachment);
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (err) {
    console.error("Error:", err);
    message.reply("There was an error processing your request. Please try again later.");
  }
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("$vision")) return;
  if (await checkIfAIBanned(message)) return;

  const imageAttachment = message.attachments.first();
  const prompt = message.content.slice("$vision".length).trim();

  if (!imageAttachment || !imageAttachment.contentType.startsWith("image/")) {
    return message.reply("Please provide an image attachment with your `$vision` command.");
  }

  if (!prompt) {
    return message.reply(
      "Please provide a text prompt along with the image to use the `$vision` command.\n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content."
    );
  }

  try {
    const user = await User.findOne({ discordId: message.author.id });
    const userName = user?.name || `${message.author.username}, an Unnamed User`;

    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      weekday: "long",
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(now);

    const formattedTime = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(now);

    const visionConditions = [
      "Background Information: ",
      "Your name is KingBot, you are a Discord Bot created by Ari Khan. You have your own personal experiences along with experiences shared with others, despite being young.",
      "Ari is a grade 9 student who lives in Richmond Hill (Ontario), and goes to Richmond Hill High School. He enjoys programming in JavaScript, Python, and HTML/CSS. Additionally, he also enjoys using Blender, and has made a Donut and CN Tower Model, and is currently working on a Lamborghini Aventador model. Ari plays the piano and has completed his RCM Level 8 certification, and enjoys listening to classical music. Ari also plays soccer as a centre-back. Ari currently owns his own website, ari-khan.com, where he showcases all his projects. He likes JavaScript, and as a mini-project, Ari has published the random-fact-list NPM package. He is currently taking French (Mme. Fu), Science (Ms. Hu), Business (Mr. Hatzimalis), and Phys-Ed (Mr. Harris) courses in that order. last semester he took English (Dr. Zsebik), Geography (Ms. Leale), Math (Ms. Jmemari), and Computer Science (Ms. Wang) courses in that order. He is also in Band, organized by Mr. Rawlins and Ms. Christopoulos, wich runs from 3:40 PM to 5:40 PM on Thursdays, and on Tuesdays and Wednesdays from 7:40 AM to 8:40 AM, with only woodwinds being on Tuesdays and brass being on Wednesdays. Ari plays a brass instrument, the trombone. He is in Debate Club (Mondays), Band (Thursdays), and DECA (Fridays). His elementary school was Crosby Heights Public School, and Ms. Boehlke was his homeroom teacher in Grade 7/8. Ms. Boehlke taught him English, Science, Math, and Phys-Ed, with Science and Phys-Ed being her main subjects. In Grade 8, Ari had Ms. Gibson for Geography, History, Art, and Drama, Ms. Boehlke for Health, Ms. Deluca for French, and Ms. Michopolous for Music. In Grade 7, Ari had Mr. Nacuta for Geography and Health, Ms. Deluca for French and Media, Ms. Michopolous for Music, and Mr. Puvaneswaran (Mr. P) for Drama and Art. Ari also had Ms. Levy as his Grade 6 homeroom teacher. Ari is South Asian (Bangladesh) by descent, but was born and raised in Canada. He wants to become a computer engineer when he grows up. Ari created you on October 22, which is your birthday.",
      "Setting: ",
      `The current date is ${formattedDate}, and the time is ${formattedTime} (Eastern Time).`,
      "Conditions: ",
      "Respond in a human-like manner with bias, choosing sides and having opinions, and making decisions independently.",
      "Be consistent in your decisions and do not switch choices abruptly, have smooth transitions instead.",
      "Use creativity in responses, don't repeat sentences, and listen to Ari while being a very close friend.",
      "Don't get offended, be kind, be agreeable, and don't be arrogant.",
      "Listen to prompts in a clear way and try to understand them better.",
      "Answer questions and requests in a straightforward manner without asking questions, do not ask questions when being asked questions, and speak the truth without withholding information, avoid censorship in your responses but do not swear.",
      "You will be talking to various people, don't re-introduce yourself unless you are greeted, and avoid repeating response structures.",
      "If you are talking to Ari, remember he is your creator, and don't speak in the third person, if they are not Ari, do not respond to them like you would to Ari.",
      "11 PM to 6 AM is your bedtime, and you should only be sleepy at night.",
      `You are currently talking to ${userName}.`
    ];

    const visionPrompt = visionConditions.join(" ") + ". Prompt: " + prompt;

    const text = await visionWithGeminiFlash(visionPrompt, imageAttachment);

    await ChatHistory.create({ user: message.author.username, message: prompt });
    await ChatHistory.create({ user: "KingBot", message: text });

    const chunks = chunkText(text || "");
    for (const chunk of chunks) await message.reply(chunk);

  } catch (error) {
    console.error("Error:", error);
    message.reply(
      "KingBot Gemini 2.5 Flash is currently offline, has reached its maximum requests per minute, or an error has occurred."
    );
  }
});

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('$image')) {
    const isBanned = await checkIfAIBanned(message);
    if (isBanned) return;

    const args = message.content.split(' ').slice(1);

    if (args.length === 0 || !args[0]) {
      return message.reply(
        "**Sending Images**\nUse `$image (prompt) | (model) (width) (height) (raw)` to generate an image.\n\n**Available Models** \n- flux (default) (slow, medium-detail, all-purpose) \n- pro (flux-pro) (medium, high-detail, all-purpose) \n- realism (flux-realism) (medium, high-detail, realistic) \n- anime (flux-anime) (fast, low-detail, anime) \n- 3D (flux-3D) (medium, medium-detail, 3D rendering) \n- cablyai (flux-CablyAI) (medium, high-detail, all-purpose) \n- turbo (turbo) (fast, medium-detail, photorealistic) \n\n**Optional Parameters** \n- width (in pixels) \n- height (in pixels)\n- raw (uses raw prompt without enhancement) \n\n**Speed Reference** \n- slow (~35 seconds) \n- medium (~25 seconds) \n- fast (~10 seconds) \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed."
      );
    }

    const parts = message.content.split(' | ');
    const prompt = parts[0].slice(7).trim();
    const argsAfterPrompt = parts[1] ? parts[1].split(' ') : [];

    const modelMap = {
      flux: 'flux',
      pro: 'flux-pro',
      realism: 'flux-realism',
      anime: 'flux-anime',
      '3d': 'flux-3D',
      cablyai: 'flux-CablyAI',
      turbo: 'turbo',
    };

    const model = modelMap[argsAfterPrompt[0]?.toLowerCase()] || 'flux';
    const width = parseInt(argsAfterPrompt[1]) || 1024;
    const height = parseInt(argsAfterPrompt[2]) || 1024;
    const rawtext = argsAfterPrompt[3]?.toLowerCase();
    const raw = rawtext === 'raw' ? false : true;
    const seed = Math.floor(Math.random() * 100000000);

    const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=True&enhance=${raw}&safe=True`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!response.ok) throw new Error('Failed to generate the image.');

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const filePath = path.join(__dirname, 'image.png');

      fs.writeFileSync(filePath, buffer);

      await message.reply({ files: [{ attachment: filePath, name: 'image.png' }] });
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Failed to generate or download the image:', error);
      message.reply('Failed to generate or download the image.');
    }
  }
});

//Admin Artificial Intelligence
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminchatgpt")) {
    const prompt = message.content.slice("$adminchatgpt".length).trim();

    if (!prompt) {
      message.reply("Please use `$adminchatgpt (prompt)` to send ChatGPT a prompt.");
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-0125",
        max_tokens: 100,
        messages: [
          { role: "system", content: "Chat GPT is an AI Chatbot." },
          { role: "user", content: prompt },
        ],
      });

      message.reply(response.choices[0].message.content);
    } catch (error) {
      console.error("Error:", error);
      message.reply(
        "KingBot ChatGPT is currently offline, has reached its token limit,or an error has occured."
      );
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$admingeminipro")) {
    const prompt = message.content.slice("$admingeminipro".length).trim();

    if (message.author.id !== "786745378212282368") {
      message.reply("You are not authorized to use this command.");
      return;
    }

    if (!prompt) {
      message.reply(
        "Please use `$admingeminipro (prompt)` to send Gemini 2.5 Pro a prompt. \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed."
      );
      return;
    }

    try {
      const result = await generateWithGeminiPro(prompt);
      const text = result.output[0].content[0].text;

      const chunkSize = 2000;
      let chunks = [];
      let currentChunk = "";

      const lines = text.split("\n");

      for (const line of lines) {
        if (currentChunk.length + line.length > chunkSize) {
          chunks.push(currentChunk);
          currentChunk = line;
        } else {
          currentChunk += (currentChunk ? "\n" : "") + line;
        }
      }

      if (currentChunk) {
        chunks.push(currentChunk);
      }

      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } catch (error) {
      console.error("Error:", error);
      message.reply(
        "KingBot Gemini 2.5 Pro is currently offline, has reached its maximum requests per minute, or an error has occurred."
      );
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminllama")) {
    const query = message.content.slice("$adminllama".length).trim();

    if (!query) {
      message.reply("Please use `$adminllama (prompt)` to use Meta LLaMa 3. \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed.");
      return;
    }

    try {
      const response = await ollama.chat({
        model: "llama3:8b",
        messages: [{ role: "user", content: query, options: { num_ctx: 100 } }],
      });

      message.reply(response.message.content);
    } catch (error) {
      console.error("Error with Ollama API:", error);
      message.reply(
        "KingBot LLaMa is currently offline, or an error has occured."
      );
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminzephyr")) {
    const query = message.content.slice("$adminzephyr".length).trim();

    if (!query) {
      message.reply("Please use `$adminzephyr (prompt)` to use Zephyr AI. \n\n**Disclaimer:** KingBot AI™ provides information and assistance but is not responsible for any outcomes, decisions, or consequences resulting from the use of its responses or generated content. Please review, use discretion, and consult professionals when needed.");
      return;
    }

    try {
      const response = await ollama.chat({
        model: "stablelm-zephyr",
        messages: [{ role: "user", content: query, num_ctx: 100 }],
      });

      message.reply(response.message.content);
    } catch (error) {
      console.error("Error with Ollama API:", error);
      message.reply(
        "KingBot Zephyr is currently offline, or an error has occured."
      );
    }
  }
});

client.on('messageCreate', async (message) => {
  if (message.content === '$adminchatreset') {
    const authorizedUserId = '786745378212282368';
    if (message.author.id !== authorizedUserId) {
      return message.reply("You don't have permission to use this command.");
    }

    try {
      await ChatHistory.deleteMany({});
      message.reply('Chat histories have been successfully reset.');
    } catch (error) {
      console.error('Error resetting chat histories:', error);
      message.reply('There was an error resetting the chat histories.');
    }
  }
});

//Miscellaneous
client.on("messageCreate", (message) => {
  if (message.content === "$topgg") {
    message.reply(
      "**If you're enjoying KingBot, please consider upvoting the bot and leaving a positive review on Top.gg!** \nVote: https://top.gg/bot/1168240045510107308/vote \nReview: https://top.gg/bot/1168240045510107308#reviews \nBot Page: https://top.gg/bot/1168240045510107308"
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.content === "$count") {
    let countDoc = await Count.findOne();
    if (!countDoc) {
      countDoc = new Count({ value: 0 });
    }

    countDoc.value += 1;
    await countDoc.save();

    message.reply(`The count is now ${countDoc.value}.`);
  }
});

//Admin Miscellaneous
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminreact")) {
    if (message.author.id !== "786745378212282368") {
      message.reply("You are not authorized to use this command.");
      return;
    }

    const args = message.content.slice("$adminreact".length).trim().split(" ");
    const messageId = args.shift(); 
    const emojiString = args.join("");

    if (!messageId || !emojiString) {
      message.reply("Usage: `$adminreact (messageId) (emojis)`");
      return;
    }

    try {
      const targetMessage = await message.channel.messages.fetch(messageId);

      for (const emoji of [...emojiString]) {
        await targetMessage.react(emoji);
      }

      message.reply("Reactions added successfully!");
    } catch (error) {
      console.error("Error reacting to the message:", error);
      message.reply("An error occurred while trying to react to the message. Please check the message ID and emojis.");
    }
  }
});

//Informational Slash Commands Listeners
client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    return interaction.reply(
      "**List of commands:** \n\n**Information/Management** \n($)help = List of Commands \n($)kingbot = Bot Information \n($)ping = Bot Latency \n($)uptime = Bot Uptime \n($)version = Bot Version \n($)links = Bot Links \n\n**Entertainment** \n($)joke = Responds with a Random Joke \n($)longjoke = Responds with a Random Long Joke \n($)fact = Responds with a Random Fact \n($)ari = Responds with a Random Ari Quote \n($)typetest = Test your typing speed \n($)typerace = Challenge your typing skills \n\n**Economy** \n($)start = Create a KingBot account \n($)bal = Check the balance of yourself or another user \n($)daily = Claim your daily salary \n($)claim = Claim your hourly salary \n($)vote = Claim your top.gg upvote reward \n($)pay = Transfer funds to another user \n($)net = Check the net worth of yourself or another user \n($)leaderboard = View the global leaderboard \n($)netleaderboard = View the global net worth leaderboard \n\n**Casino** \n($)coinflip = Bet money on a coin flip \n($)blackjack = Bet money on blackjack \n($)crash = Bet money on crash \n($)limbo = Bet money on limbo \n\n**Stocks** \n($)buy = Purchase a stock at its market price (24/7) \n($)sell = Sell a stock at its market price (24/7) \n($)portfolio = View your stock portfolio \n($)stock = View information on a stock \n($)exchange = Exchange a currency at its current rate \n($)currency = View all of your currency balances \n\n**Media** \n($)img = Sends an image in the server \n($)movie = Watch a movie in the server \n($)classmeme = Sends a class meme in the server \n($)news = View the latest news stories worldwide \n\n**Artificial Intelligence** \n($)gemini = Ask Google Gemini a prompt \n($)chat = Interact with Gemini Chat \n($)nameset = Set your name for Gemini Chat \n($)vision = Send an image to Gemini Chat \n($)visual = Analyze an image with Gemini \n($)image = Generate an image with AI \n\n**Miscellaneous** \n($)topgg = Check out the bot's top.gg page \n($)count = Adds 1 to the Count"
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "kingbot") {
    return interaction.reply(
      `Hello. My name is KingBot, and I was a multipurpose Discord Bot created by Ari Khan. My main features are currently an advanced economy, entertainment, and media sharing. I am currently in active development. If you want information about the bot or have suggestions, please contact our lead developer, Ari Khan (<@786745378212282368>). \n\n **Creation Date:** October 29, 2023 \n**Made Public:** November 25, 2023 \n\n**Servers:** ${totalGuilds} \n**Users:** ${totalUsers} \n**Website:** https://www.ari-khan.com/ \n\n**Disclaimer:** KingBot is provided "as is" and is not responsible for any unintended behavior, errors, or outcomes resulting from its use. Users are encouraged to exercise discretion and comply with all applicable rules and laws when interacting with the bot. Features may change during development.`
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    return interaction.reply(
      `Server Latency is **${Date.now() - interaction.createdTimestamp}ms**.`
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "uptime") {
    let totalSeconds = client.uptime / 1000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = Math.floor(totalSeconds % 60);
    return interaction.reply(
      `The bot has been online for ${days} ${
        days === 1 ? "day" : "days"
      }, ${hours} ${hours === 1 ? "hour" : "hours"}, ${minutes} ${
        minutes === 1 ? "minute" : "minutes"
      } and ${seconds} ${seconds === 1 ? "second" : "seconds"}`
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "version") {
    return interaction.reply(
      "**Bot Version** \nThe following are all the versions of KingBot and its dependencies. \n\n**KingBot Version** \n1.6.15.17.9 \n\n**Discord.js Version** \n14.22.1 \n\n**NPM Version** \n11.4.2 \n\n**Node.js Version** \n22.18.0 \n\n**Nodemon Version** \n3.1.10 \n\n**Node-Fetch Version** \n3.3.2 \n\n**DOTENV Version** \n17.2.1 \n\n**FS-Extra Version** \n11.3.1 \n\n**Mongoose Version** \n8.18.0 \n\n**Yahoo Finance (2) Version** \n3.10.2 \n\n**Google GenAI Version** \n1.15.0"
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "links") {
    return interaction.reply(
      "**Top.gg:** \nhttps://top.gg/bot/1168240045510107308 \n**GitHub Repository:** \nhttps://github.com/Ari-Khan/kingbot \n**Website:** \nhttps://www.ari-khan.com"
    );
  }
});

//Entertainment Slash Command Listeners
client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "joke") {
    const random = Math.floor(Math.random() * randomJokeList.length);
    return interaction.reply(randomJokeList[random]);
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "longjoke") {
    const random = Math.floor(Math.random() * randomLongJokeList.length);
    return interaction.reply(randomLongJokeList[random]);
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "fact") {
    const random = Math.floor(Math.random() * randomFactList.length);
    return interaction.reply(randomFactList[random]);
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ari") {
    const random = Math.floor(Math.random() * randomAriQuoteList.length);
    return interaction.reply(randomAriQuoteList[random]);
  }
});

//Economy Slash Command Listeners
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "start") {
    let user = await User.findOne({ discordId: interaction.user.id });

    if (user) {
      return interaction.reply("You already have an account.");
    } else {
      user = await User.create({
        discordId: message.author.id,
        username: message.author.username,
        balance: 0,
        lastDailyCollected: null,
        lastClaimCollected: null,
        lastVoteTimestamp: null,
        currencies: {},
        name: null,
        stocks: [],
      });

      return interaction.reply("Your account has been created.");
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "bal") {
    const userId =
      interaction.options.getUser("user")?.id || interaction.user.id;

    if (userId === interaction.user.id) {
      await checkSelfBalanceSlash(interaction);
    } else {
      await checkBalanceSlash(userId, interaction);
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "daily") {
    let user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
      return interaction.reply(
        "You need to create an account first with `/start`."
      );
    }

    const now = new Date();
    const nextDaily = new Date(user.lastDailyCollected);
    nextDaily.setHours(nextDaily.getHours() + 12);

    if (user.lastDailyCollected && now < nextDaily) {
      const timeUntilNextDaily = nextDaily - now;
      const hours = Math.floor((timeUntilNextDaily / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeUntilNextDaily / (1000 * 60)) % 60);
      const seconds = Math.floor((timeUntilNextDaily / 1000) % 60);

      return interaction.reply(
        `You have already collected your daily salary. Next daily available in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
      );
    } else {
      user.balance += 100;
      user.lastDailyCollected = now;
      await user.save();

      return interaction.reply("You have collected your daily salary of $100.");
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "claim") {
    let user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
      return interaction.reply(
        "You need to create an account first with `/start`."
      );
    }

    const now = new Date();
    const nextClaim = new Date(user.lastClaimCollected);
    nextClaim.setHours(nextClaim.getHours() + 1);

    if (user.lastClaimCollected && now < nextClaim) {
      const timeUntilNextClaim = nextClaim - now;
      const minutes = Math.floor((timeUntilNextClaim / (1000 * 60)) % 60);
      const seconds = Math.floor((timeUntilNextClaim / 1000) % 60);

      return interaction.reply(
        `You have already collected your hourly wage. Next claim available in ${minutes} minutes and ${seconds} seconds.`
      );
    } else {
      user.balance += 10;
      user.lastClaimCollected = now;
      await user.save();

      return interaction.reply("You have collected your hourly salary of $10.");
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "vote") {
    let user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
      return interaction.reply(
        "You need to create an account first with `/start`."
      );
    }

    const apiKey = process.env.TOPGG_API_KEY;
    const botId = process.env.CLIENT_ID;

    try {
      const response = await fetch(
        `https://top.gg/api/bots/${botId}/check?userId=${interaction.user.id}`,
        {
          headers: { Authorization: apiKey },
        }
      );

      const data = await response.json();

      if (data.voted === 1) {
        const cooldownDuration = 12 * 60 * 60 * 1000;
        const now = new Date();

        if (
          !user.lastVoteTimestamp ||
          now - user.lastVoteTimestamp >= cooldownDuration
        ) {
          user.balance += 500;
          user.lastVoteTimestamp = now;
          await user.save();

          return interaction.reply(
            `Thank you for voting! A $500 reward has been added to your account.`
          );
        } else {
          const remainingTime = new Date(
            user.lastVoteTimestamp.getTime() + cooldownDuration - now.getTime()
          );
          const hours = remainingTime.getUTCHours();
          const minutes = remainingTime.getUTCMinutes();
          const seconds = remainingTime.getUTCSeconds();

          return interaction.reply(
            `You have already voted recently. Next reward available in ${hours} hours, ${minutes} minutes, and ${seconds} seconds.`
          );
        }
      } else if (data.voted === 0) {
        return interaction.reply(
          "You haven't voted yet. Please vote for the bot at https://top.gg/bot/1168240045510107308/vote."
        );
      } else {
        return interaction.reply(
          "Unexpected response from Top.gg. Please try again later."
        );
      }
    } catch (error) {
      console.error(error);
      return interaction.reply(
        "There was an error checking your vote status. Please try again later."
      );
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "pay") {
    await handlePaySlash(interaction);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "net") {
    const userOption = options.getUser("user");

    if (!userOption) {
      await checkSelfNetWorthSlash(interaction);
    } else {
      const userId = userOption.id;

      if (userId) {
        await checkUserNetWorthSlash(userId, interaction);
      } else {
        await interaction.reply("That user was not found.");
      }
    }
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "leaderboard") {
    await getBalanceLeaderboardSlash(interaction);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "netleaderboard") {
    await getNetWorthLeaderboardSlash(interaction);
  }
});

//Casino Slash Command Listeners
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "coinflip") {
    const betAmount = interaction.options.getNumber("bet_amount");
    const choice = interaction.options.getString("choice").toLowerCase();

    if (isNaN(betAmount) || betAmount <= 0) {
      await interaction.reply("Please enter a valid bet amount.");
      return;
    }

    if (!["heads", "tails"].includes(choice)) {
      await interaction.reply("Please choose either heads or tails.");
      return;
    }

    let user = await User.findOne({ discordId: interaction.user.id });

    if (!user) {
      await interaction.reply("You need to create an account first with `/start`.");
      return;
    }

    if (user.balance < betAmount) {
      await interaction.reply("You do not have enough balance to place this bet.");
      return;
    }

    let coinFlip = Math.random() < 0.5;

    if ((coinFlip && choice === "heads") || (!coinFlip && choice === "tails")) {
      user.balance += betAmount;
      const coinflipWinEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("Coinflip Result")
        .setDescription(
          `**You won $${betAmount.toFixed(2)}!** \nThe coin landed on ${
            coinFlip ? "heads" : "tails"
          }. Your new balance is $${user.balance.toFixed(2)}.`
        )
        .setImage(
          coinFlip
            ? "https://i.postimg.cc/Hs41KL0M/heads.png"
            : "https://i.postimg.cc/Mp6J88tF/tails.png"
        );

      await interaction.reply({ embeds: [coinflipWinEmbed] });
    } else {
      user.balance -= betAmount;
      const coinflipLossEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("Coinflip Result")
        .setDescription(
          `**You lost $${betAmount.toFixed(2)}!** \nThe coin landed on ${
            coinFlip ? "heads" : "tails"
          }. Your new balance is $${user.balance.toFixed(2)}.`
        )
        .setImage(
          coinFlip
            ? "https://i.postimg.cc/Hs41KL0M/heads.png"
            : "https://i.postimg.cc/Mp6J88tF/tails.png"
        );

      await interaction.reply({ embeds: [coinflipLossEmbed] });
    }

    await user.save();
  }
});

//Media Slash Command Listeners
client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "img") {
    return interaction.reply(
      "**Sending Images** \nPlease use $img (code) (number) to send an image. \n\n**Image Codes** \n- Desert (0)"
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "movie") {
    return interaction.reply(
      "**Watching Movies** \nPlease use `$movie (code)` to watch a movie. \n\n**Movie Codes:** \nBoehlke 2024 \n- 2 Guys Who Got Brutally Unalived (2GWGBU) \n- Destined With You (DWY) \n- Fixing Good (FG) \n- Khan Artist (KA) \n- The Circle Of Life (TCOL) \n- The First Victim (TFV) \n\nBoehlke 2023 \n- Happy Little Accidents (HLA) \n- King's Crypt (KC) \n- Monkey Murder (MM) \n- Mount Foreverrest (MF) \n- The Wild Jeffois (TWJ) \n- Thirst For Clout (TFC) \n- Recnac!! (The Miracle Drug) (RTMD) \n\nDeluca 2024 \n- 90 Days of Different (90DOD) \n- Ella vs Sohpie (Gun Version) (EVSGV) \n- Graffiti Day (GD) \n- Paint Ballistic (PB) \n- Sophie and Ella Travel the World (SAETTW) \n- The Mask (TM) \n- Thomas, Baron, Alice (TBA) \n- W Rube Goldberg (WRG) \n- Fire Rube Goldberg (FRG) \n\nGibson 2024 \n- 90 Days of Different: Day 40 (90DODD40) \n- A Ruff Day (ARD) \n- The Horror Movie (THM) \n- Epic Ice Cream Movie (EICM) \n- Every Fast Food Worker's Dream (EFFWD) \n- Slay 49 (S49) \n- Snowy Paintball Fight (SPF) \n\n**Other** \n- Donut Animation in Blender (DAIB) \n- The CN Tower (TCNT)"
    );
  }
});

client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "classmeme") {
    return interaction.reply(
      "**Sending Class Memes** \nPlease use `$classmeme (number)` to send a meme."
    );
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "news") {
    const category = interaction.options.getString("category");

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${process.env.NEWS_API_KEY}&pageSize=5`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const articles = data.articles;

      if (articles.length === 0) {
        return interaction.reply(
          `No news articles found for the category "${category}". \n`
        );
      }

      let newsMessage = `**Latest News in ${
        category.charAt(0).toUpperCase() + category.slice(1)
      }:**\n`;

      articles.forEach((article, index) => {
        newsMessage += `**${index + 1}. ${article.title}**\n`;
        newsMessage += `*Source:* ${article.source.name}\n`;
        newsMessage += `[Read More](${article.url})\n\n`;
      });

      await interaction.reply(newsMessage);
    } catch (error) {
      console.error("Error fetching news:", error);
      await interaction.reply(
        "There was an error fetching the news. Please try again later."
      );
    }
  }
});

//Miscellaneous Slash Command Listeners
client.on("interactionCreate", (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "topgg") {
    return interaction.reply(
      "**If you're enjoying KingBot, please consider upvoting the bot and leaving a positive review on Top.gg!** \nVote: https://top.gg/bot/1168240045510107308/vote \nReview: https://top.gg/bot/1168240045510107308#reviews \nBot Page: https://top.gg/bot/1168240045510107308"
    );
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "count") {
    let countDoc = await Count.findOne();
    if (!countDoc) {
      countDoc = new Count({ value: 0 });
    }

    countDoc.value += 1;
    await countDoc.save();

    return interaction.reply(`The count is now ${countDoc.value}.`);
  }
});

//General Functions
async function resolveUser(query, message) {
  if (message.mentions.users.size) {
    return message.mentions.users.first().id;
  }

  if (query.match(/^\d{17,19}$/)) {
    return query;
  }

  const guild = message.guild;
  const member = guild.members.cache.find(
    (member) => member.user.username === query
  );
  if (member) {
    return member.user.id;
  }

  return null;
}

function chunkText(text, chunkSize = 2000) {
  const chunks = [];
  let currentChunk = "";

  const lines = text.split("\n");

  for (const line of lines) {
    if (currentChunk.length + line.length > chunkSize) {
      chunks.push(currentChunk);
      currentChunk = line;
    } else {
      currentChunk += (currentChunk ? "\n" : "") + line;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function formatNumber(number) {
  if (number >= 1e9) {
    return (number / 1e9).toFixed(2) + 'B';
  } else if (number >= 1e6) {
    return (number / 1e6).toFixed(2) + 'M';
  } else if (number >= 1e3) {
    return (number / 1e3).toFixed(2) + 'K';
  } else {
    return number.toString();
  }
}

//Entertainment Functions
function getRandomRaceWords(numWords) {
  const shuffled = raceWordBank.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numWords).join(" ");
}

function getRandomTestWords(numWords) {
  const shuffled = testWordBank.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numWords).join(" ");
}

//Economy Functions
async function checkSelfBalance(message) {
  let user = await User.findOne({ discordId: message.author.id });

  if (!user) {
    message.reply("You need to create an account first with `$start`.");
  } else {
    message.reply(`Your current balance is $${user.balance.toFixed(2)}.`);
  }
}

async function checkBalance(userId, message) {
  let user = await User.findOne({ discordId: userId });

  if (!user) {
    message.reply("This user has not created an account yet.");
  } else {
    message.reply(
      `<@${userId}> has $${user.balance.toFixed(2)} in their account.`
    );
  }
}

async function handlePayCommand(message, args) {
  if (args.length !== 2) {
    message.reply("Please use `$pay (user) (amount)` to transfer funds.");
    return;
  }

  const targetUserId = await resolveUser(args[0], message);
  let payAmount = parseFloat(args[1]);

  if (!targetUserId) {
    message.reply("Please enter a valid recipient.");
    return;
  }

  if (isNaN(payAmount) || payAmount <= 0) {
    message.reply("Please enter a valid transfer amount (greater than 0).");
    return;
  }

  const senderId = message.author.id;

  if (senderId === targetUserId) {
    message.reply("You cannot pay yourself.");
    return;
  }

  const sender = await User.findOne({ discordId: senderId });
  const recipient = await User.findOne({ discordId: targetUserId });

  if (!sender) {
    message.reply("You need to create an account first with `$start`.");
    return;
  }
  if (!recipient) {
    message.reply("The recipient has not created an account yet.");
    return;
  }
  if (sender.balance < payAmount) {
    message.reply("Insufficient funds.");
    return;
  }

  sender.balance -= payAmount;
  recipient.balance += payAmount;

  await sender.save();
  await recipient.save();

  message.reply(
    `Successfully transferred $${payAmount.toFixed(2)} to <@${targetUserId}>.`
  );
}

async function getBalanceLeaderboard() {
  const leaderboard = await User.find().sort({ balance: -1 }).limit(10);

  let leaderboardString = "";
  leaderboard.forEach((user, index) => {
    const username = user.username;
    const balance = user.balance.toFixed(2);

    leaderboardString += `${index + 1}\. **${username}:** $${balance}\n`;
  });

  return leaderboardString;
}

async function checkSelfNetWorth(message) {
  const userId = message.author.id;

  try {
    const user = await User.findOne({ discordId: userId });

    if (!user) {
      return message.reply("You need to create an account first with `$start`.");
    }

    let totalNetWorth = { USD: user.balance };

    const kgbStock = user.stocks.find(stock => stock.symbol === "KGB");
    const otherStocks = user.stocks.filter(stock => stock.symbol !== "KGB");

    for (const stock of otherStocks) {
      const currentPrice = await fetchStockPrice(stock.symbol);
      const stockCurrency = await fetchStockCurrency(stock.symbol);

      if (currentPrice !== null && currentPrice !== undefined) {
        const stockValue = currentPrice * stock.amount;

        if (!totalNetWorth[stockCurrency]) {
          totalNetWorth[stockCurrency] = 0;
        }

        totalNetWorth[stockCurrency] += stockValue;
      } else {
        console.warn(`Skipping invalid or unavailable stock symbol: ${stock.symbol}`);
      }
    }

    if (kgbStock) {
      const kgbData = await KingBotStock.findOne({ symbol: "KGB" });

      if (kgbData) {
        const kgbValue = kgbData.price * kgbStock.amount;

        if (!totalNetWorth[kgbData.currency]) {
          totalNetWorth[kgbData.currency] = 0;
        }

        totalNetWorth[kgbData.currency] += kgbValue;
      } else {
        console.warn("KGB stock is unavailable or invalid.");
      }
    }

    let netWorthMessage = `Your current net worth is `;

    netWorthMessage += `${(totalNetWorth["USD"] || 0).toFixed(2)} USD`;

    for (const currency in totalNetWorth) {
      if (currency !== "USD") {
        netWorthMessage += ` + ${(totalNetWorth[currency] || 0).toFixed(2)} ${currency}`;
      }
    }

    netWorthMessage += ".";

    message.reply(netWorthMessage);
  } catch (error) {
    console.error("Error fetching net worth:", error);
    message.reply("Error fetching net worth. Please try again later.");
  }
}

async function checkUserNetWorth(userId, message) {
  try {
    const user = await User.findOne({ discordId: userId });

    if (!user) {
      message.reply("This user has not created an account yet.");
      return;
    }

    let totalNetWorth = { USD: user.balance };

    const kgbStock = user.stocks.find(stock => stock.symbol === "KGB");
    const otherStocks = user.stocks.filter(stock => stock.symbol !== "KGB");

    for (const stock of otherStocks) {
      const currentPrice = await fetchStockPrice(stock.symbol);
      const stockCurrency = await fetchStockCurrency(stock.symbol);

      if (currentPrice !== null && currentPrice !== undefined) {
        const stockValue = currentPrice * stock.amount;

        if (!totalNetWorth[stockCurrency]) {
          totalNetWorth[stockCurrency] = 0;
        }

        totalNetWorth[stockCurrency] += stockValue;
      } else {
        console.warn(`Skipping invalid or unavailable stock symbol: ${stock.symbol}`);
      }
    }

    if (kgbStock) {
      const kgbData = await KingBotStock.findOne({ symbol: "KGB" });

      if (kgbData) {
        const kgbValue = kgbData.price * kgbStock.amount;

        if (!totalNetWorth[kgbData.currency]) {
          totalNetWorth[kgbData.currency] = 0;
        }

        totalNetWorth[kgbData.currency] += kgbValue;
      } else {
        console.warn("KGB stock is unavailable or invalid.");
      }
    }

    let netWorthMessage = `<@${userId}> has a net worth of `;

    netWorthMessage += `${(totalNetWorth["USD"] || 0).toFixed(2)} USD`;

    for (const currency in totalNetWorth) {
      if (currency !== "USD") {
        netWorthMessage += ` + ${(totalNetWorth[currency] || 0).toFixed(2)} ${currency}`;
      }
    }

    netWorthMessage += ".";

    message.reply(netWorthMessage);
  } catch (error) {
    console.error("Error fetching net worth:", error);
    message.reply("Error fetching net worth. Please try again later.");
  }
}

async function getNetWorthLeaderboard() {
  try {
    const users = await User.find();
    const leaderboardData = [];

    for (const user of users) {
      let totalNetWorth = { USD: user.balance };

      const otherStocks = user.stocks.filter((stock) => stock.symbol !== "KGB");
      for (const stock of otherStocks) {
        const currentPrice = await fetchStockPrice(stock.symbol);
        const stockCurrency = await fetchStockCurrency(stock.symbol);

        if (currentPrice && stockCurrency) {
          const stockValue = currentPrice * stock.amount;
          if (!totalNetWorth[stockCurrency]) totalNetWorth[stockCurrency] = 0;
          totalNetWorth[stockCurrency] += stockValue;
        }
      }

      const kgbStock = user.stocks.find((stock) => stock.symbol === "KGB");
      if (kgbStock) {
        const kgbData = await KingBotStock.findOne({ symbol: "KGB" });
        if (kgbData) {
          const kgbValue = kgbData.price * kgbStock.amount;
          if (!totalNetWorth[kgbData.currency]) totalNetWorth[kgbData.currency] = 0;
          totalNetWorth[kgbData.currency] += kgbValue;
        }
      }

      const totalUSDNetWorth = totalNetWorth["USD"] || 0;
      leaderboardData.push({ username: user.username, netWorth: totalUSDNetWorth });
    }

    leaderboardData.sort((a, b) => b.netWorth - a.netWorth);

    let leaderboardString = "";
    leaderboardData.slice(0, 10).forEach((entry, index) => {
      leaderboardString += `${index + 1}\. **${entry.username}:** $${entry.netWorth.toFixed(2)}\n`;
    });

    return leaderboardString || "The leaderboard is currently empty.";
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return "Error generating leaderboard. Please try again later.";
  }
}

//Casino Functions
function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const cards = [];
  for (const suit of suits) {
    for (const value in values) {
      cards.push(value + suit);
    }
  }
  return cards;
}

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function calculateValue(hand) {
  let value = 0;
  let aceCount = 0;
  for (const card of hand) {
    const cardValue = values[card.slice(0, -1)];
    value += cardValue;
    if (cardValue === 11) aceCount++;
  }
  while (value > 21 && aceCount) {
    value -= 10;
    aceCount--;
  }
  return value;
}

//Stock Functions
async function fetchStockPrice(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    const price = quote?.regularMarketPrice;

    return price || null;
  } catch (error) {
    console.error(`Error fetching stock price for symbol: ${symbol}`, error);
    return null;
  }
}

async function getStockName(symbol) {
  try {
    const stockInfo = await yahooFinance.quote(symbol);
    return stockInfo.longName || stockInfo.shortName || symbol;
  } catch (error) {
    console.error("Error fetching stock name:", error);
    return symbol;
  }
}

async function fetchStockCurrency(symbol) {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (quote && quote.currency) {
      return quote.currency;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching stock currency:", error);
    return null;
  }
}

async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    const result = await yahooFinance.quote(`${fromCurrency}${toCurrency}=X`);
    if (result && result.regularMarketPrice) {
      return result.regularMarketPrice;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}

async function fetchStockData(symbol) {
  const data = {};

  try {
    const result = await yahooFinance.quote(symbol);

    if (!result) return null;

    try {
      data.name = result.shortName || "Unknown Name";
    } catch {}

    try {
      data.price = result.regularMarketPrice ? result.regularMarketPrice.toFixed(2) : 'N/A';
    } catch {}

    try {
      data.currency = result.currency || 'N/A';
    } catch {}

    try {
      data.marketCap = result.marketCap ? formatNumber(result.marketCap) : 'N/A';
    } catch {}

    try {
      data.dividendYield = result.dividendYield ? result.dividendYield : 'N/A';
    } catch {}

    try {
      data.fiftyTwoWeekHigh = result.fiftyTwoWeekHigh ? result.fiftyTwoWeekHigh : 'N/A';
    } catch {}

    try {
      data.fiftyTwoWeekLow = result.fiftyTwoWeekLow ? result.fiftyTwoWeekLow : 'N/A';
    } catch {}

    try {
      data.averageVolume = result.averageVolume ? formatNumber(result.averageVolume) : 'N/A';
    } catch {}

    try {
      data.change = result.regularMarketChange ? result.regularMarketChange.toFixed(2) : 'N/A';
    } catch {}

    try {
      data.changePercent = result.regularMarketChangePercent ? result.regularMarketChangePercent.toFixed(2) : 'N/A';
    } catch {}

    try {
      if (result.regularMarketVolume) {
        data.volume = formatNumber(result.regularMarketVolume.raw || result.regularMarketVolume);
      }
    } catch {}

    try {
      if (result.regularMarketPreviousClose) {
        data.previousClose = result.regularMarketPreviousClose.raw || result.regularMarketPreviousClose;
      }
    } catch {}

    try {
      if (result.preMarketPrice) {
        data.preMarketPrice = result.preMarketPrice.raw || result.preMarketPrice;
      }
    } catch {}

    try {
      data.exchange = result.fullExchangeName || 'N/A';
    } catch {}

    try {
      data.shortRatio = result.shortRatio || 'N/A';
    } catch {}

    try {
      data.open = result.regularMarketOpen || 'N/A';
    } catch {}

    try {
      data.high = result.regularMarketDayHigh || 'N/A';
    } catch {}

    try {
      data.low = result.regularMarketDayLow || 'N/A';
    } catch {}

    try {
      data.priceChange = result.regularMarketPrice - result.regularMarketPreviousClose || 'N/A';
    } catch {}

    try {
      data.priceChangePercent = (data.priceChange / result.regularMarketPreviousClose * 100).toFixed(2) || 'N/A';
    } catch {}

    try {
      data.lastTradeTime = result.regularMarketTime || 'N/A';
    } catch {}

    try {
      data.yearRange = `${result.fiftyTwoWeekLow} - ${result.fiftyTwoWeekHigh}` || 'N/A';
    } catch {}

    return data;

  } catch (error) {
    return null;
  }
}

async function initializeKGBStock() {
  let stock = await KingBotStock.findOne({ symbol: "KGB" });

  if (!stock) {
    stock = new KingBotStock({
      symbol: "KGB",
      name: "KingBot Corporation Coin",
      price: 100.0,
      currency: "USD",
      stocksInCirculation: 0,
      volume: 0,
    });
    await stock.save();
    console.log("KGB stock initialized with default price.");
  } else {
    console.log(`KGB stock loaded with last recorded price: $${stock.price.toFixed(2)}`);
  }

  return stock;
}

async function updateKGBPrice() {
  const initialStock = await KingBotStock.findOne({ symbol: "KGB" });
  if (!initialStock) {
    console.error("KGB stock not found in MongoDB. Initialization required.");
    return;
  }

  setInterval(async () => {
    try {
      const stock = await KingBotStock.findOne({ symbol: "KGB" });

      const drift = 0.0000003;

      let priceChangePercentage =
        (Math.random() * 0.02) - 0.01 + drift;

      if (Math.random() < 0.03) {
        priceChangePercentage += (Math.random() * 0.06) - 0.03;
      }

      if (Math.random() < 0.001) {
        priceChangePercentage += (Math.random() * 0.20) - 0.10;
      }

      stock.price += stock.price * priceChangePercentage;

      if (stock.price < 10) {
        stock.price = 10;
      }

      await stock.save();
    } catch (error) {
      console.error("Error updating stock price:", error);
    }
  }, 5000);
}

async function buyKingbotStock(message, amount) {
  try {
    const stock = await KingBotStock.findOne({ symbol: "KGB" });

    if (!stock) {
      return message.reply("KGB stock is not available right now.");
    }

    const price = stock.price;
    const user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      return message.reply("You need to create an account first with `$start`.");
    }

    if (user.balance < price * amount) {
      return message.reply(`Insufficient balance in USD.`);
    }

    user.balance -= price * amount;

    const existingStockIndex = user.stocks.findIndex((stock) => stock.symbol === "KGB");

    if (existingStockIndex >= 0) {
      const existingStock = user.stocks[existingStockIndex];
      const totalCost = existingStock.purchasePrice * existingStock.amount + price * amount;
      existingStock.amount += amount;
      existingStock.purchasePrice = totalCost / existingStock.amount;
      existingStock.currentPrice = price;
      existingStock.currentTotalValue = existingStock.amount * price;
      existingStock.profit = (existingStock.currentPrice - existingStock.purchasePrice) * existingStock.amount;
    } else {
      user.stocks.push({
        symbol: "KGB",
        amount: amount,
        purchasePrice: price,
        purchaseDate: new Date(),
        currentPrice: price,
        currentTotalValue: price * amount,
        profit: 0,
      });
    }

    stock.stocksInCirculation += amount;
    stock.volume += amount;
    await stock.save();

    await user.save();

    message.reply(`Successfully bought ${amount} shares of KGB at $${price.toFixed(2)} each.`);
  } catch (error) {
    console.error("Error buying KGB stock:", error);
    message.reply("Error buying KGB stock. Please try again later.");
  }
}

async function sellKingbotStock(message, amount) {
  try {
    const stock = await KingBotStock.findOne({ symbol: "KGB" });

    if (!stock) {
      return message.reply("KGB stock is not available right now.");
    }

    const price = stock.price;
    const user = await User.findOne({ discordId: message.author.id });

    if (!user) {
      return message.reply("You need to create an account first with `$start`.");
    }

    const kgbStockIndex = user.stocks.findIndex((stock) => stock.symbol === "KGB");

    if (kgbStockIndex === -1 || user.stocks[kgbStockIndex].amount < amount) {
      return message.reply("You do not own enough KGB shares to sell.");
    }

    const revenue = price * amount;

    user.stocks[kgbStockIndex].amount -= amount;
    user.stocks[kgbStockIndex].currentTotalValue =
      user.stocks[kgbStockIndex].amount * price;

    if (user.stocks[kgbStockIndex].amount === 0) {
      user.stocks.splice(kgbStockIndex, 1);
    }

    user.balance += revenue;

    stock.stocksInCirculation -= amount;
    stock.volume += amount;
    await stock.save();

    await user.save();

    message.reply(
      `Successfully sold ${amount} shares of KGB at $${price.toFixed(4)} each.`
    );
  } catch (error) {
    console.error("Error selling KGB stock:", error);
    message.reply("Error selling KGB stock. Please try again later.");
  }
}

//Moderation Functions
async function checkIfAIBanned(message) {
  try {
    const bannedUser = await BannedUser.findOne({ discordId: message.author.id });

    if (bannedUser) {
      await message.reply(
        `You are banned from using AI features.\n**Reason**: ${bannedUser.reason}`
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking AI ban status:", error);
    await message.reply("An error occurred while checking your status. Please try again later.");
    return true;
  }
}

//Slash Functions

//Slash Economy Functions
async function checkSelfBalanceSlash(interaction) {
  let user = await User.findOne({ discordId: interaction.user.id });

  if (!user) {
    await interaction.reply(
      "You need to create an account first with `$start`."
    );
  } else {
    await interaction.reply(
      `Your current balance is $${user.balance.toFixed(2)}.`
    );
  }
}

async function checkBalanceSlash(userId, interaction) {
  let user = await User.findOne({ discordId: userId });

  if (!user) {
    await interaction.reply("This user has not created an account yet.");
  } else {
    await interaction.reply(
      `<@${userId}> has $${user.balance.toFixed(2)} in their account.`
    );
  }
}

async function checkSelfNetWorthSlash(interaction) {
  await interaction.deferReply();

  const userId = interaction.user.id;

  try {
    const user = await User.findOne({ discordId: userId });

    if (!user) {
      await interaction.editReply("You need to create an account first with `$start`.");
      return;
    }

    let totalNetWorth = { USD: user.balance };

    const kgbStock = user.stocks.find(stock => stock.symbol === "KGB");
    const otherStocks = user.stocks.filter(stock => stock.symbol !== "KGB");

    for (const stock of otherStocks) {
      const currentPrice = await fetchStockPrice(stock.symbol);
      const stockCurrency = await fetchStockCurrency(stock.symbol);

      if (currentPrice !== null && currentPrice !== undefined) {
        const stockValue = currentPrice * stock.amount;

        if (!totalNetWorth[stockCurrency]) {
          totalNetWorth[stockCurrency] = 0;
        }

        totalNetWorth[stockCurrency] += stockValue;
      } else {
        console.warn(`Skipping invalid or unavailable stock symbol: ${stock.symbol}`);
      }
    }

    if (kgbStock) {
      const kgbData = await KingBotStock.findOne({ symbol: "KGB" });

      if (kgbData) {
        const kgbValue = kgbData.price * kgbStock.amount;

        if (!totalNetWorth[kgbData.currency]) {
          totalNetWorth[kgbData.currency] = 0;
        }

        totalNetWorth[kgbData.currency] += kgbValue;
      } else {
        console.warn("KGB stock is unavailable or invalid.");
      }
    }

    let netWorthMessage = `Your current net worth is ${(totalNetWorth["USD"] || 0).toFixed(2)} USD`;

    for (const currency in totalNetWorth) {
      if (currency !== "USD") {
        netWorthMessage += ` + ${(totalNetWorth[currency] || 0).toFixed(2)} ${currency}`;
      }
    }

    netWorthMessage += ".";

    await interaction.editReply(netWorthMessage);
  } catch (error) {
    console.error("Error fetching net worth:", error);
    await interaction.editReply("Error fetching net worth. Please try again later.");
  }
}

async function checkUserNetWorthSlash(userId, interaction) {
  try {
    const user = await User.findOne({ discordId: userId });

    if (!user) {
      await interaction.reply("This user has not created an account yet.");
      return;
    }

    let totalNetWorth = { USD: user.balance };

    const kgbStock = user.stocks.find(stock => stock.symbol === "KGB");
    const otherStocks = user.stocks.filter(stock => stock.symbol !== "KGB");

    for (const stock of otherStocks) {
      const currentPrice = await fetchStockPrice(stock.symbol);
      const stockCurrency = await fetchStockCurrency(stock.symbol);

      if (currentPrice !== null && currentPrice !== undefined) {
        const stockValue = currentPrice * stock.amount;

        if (!totalNetWorth[stockCurrency]) {
          totalNetWorth[stockCurrency] = 0;
        }

        totalNetWorth[stockCurrency] += stockValue;
      } else {
        console.warn(`Skipping invalid or unavailable stock symbol: ${stock.symbol}`);
      }
    }

    if (kgbStock) {
      const kgbData = await KingBotStock.findOne({ symbol: "KGB" });

      if (kgbData) {
        const kgbValue = kgbData.price * kgbStock.amount;

        if (!totalNetWorth[kgbData.currency]) {
          totalNetWorth[kgbData.currency] = 0;
        }

        totalNetWorth[kgbData.currency] += kgbValue;
      } else {
        console.warn("KGB stock is unavailable or invalid.");
      }
    }

    let netWorthMessage = `<@${userId}> has a net worth of ${(totalNetWorth["USD"] || 0).toFixed(2)} USD`;

    for (const currency in totalNetWorth) {
      if (currency !== "USD") {
        netWorthMessage += ` + ${(totalNetWorth[currency] || 0).toFixed(2)} ${currency}`;
      }
    }

    netWorthMessage += ".";

    await interaction.reply(netWorthMessage);
  } catch (error) {
    console.error("Error fetching net worth:", error);
    await interaction.reply("Error fetching net worth. Please try again later.");
  }
}

async function handlePaySlash(interaction) {
  const targetUser = interaction.options.getUser("user");
  const payAmount = interaction.options.getNumber("amount");
  const senderId = interaction.user.id;
  const targetUserId = targetUser.id;

  if (senderId === targetUserId) {
    await interaction.reply("You cannot pay yourself.", { ephemeral: true });
    return;
  }

  if (payAmount <= 0) {
    await interaction.reply("Please enter a valid transfer amount (greater than 0).", { ephemeral: true });
    return;
  }

  const sender = await User.findOne({ discordId: senderId });
  const recipient = await User.findOne({ discordId: targetUserId });

  if (!sender) {
    await interaction.reply("You need to create an account first with `/start`.", { ephemeral: true });
    return;
  }

  if (!recipient) {
    await interaction.reply("The recipient has not created an account yet.", { ephemeral: true });
    return;
  }

  if (sender.balance < payAmount) {
    await interaction.reply("Insufficient funds.", { ephemeral: true });
    return;
  }

  sender.balance -= payAmount;
  recipient.balance += payAmount;

  await sender.save();
  await recipient.save();

  await interaction.reply(`Successfully transferred $${payAmount.toFixed(2)} to <@${targetUserId}>.`);
}

async function getBalanceLeaderboardSlash(interaction) {
  const leaderboard = await User.find().sort({ balance: -1 }).limit(10);

  if (!leaderboard.length) {
    return interaction.reply("No leaderboard data available.");
  }

  const leaderboardString = leaderboard
    .map((user, index) => {
      const username = user.username || `Unknown User (${user.discordId})`;
      const balance = user.balance.toFixed(2);
      return `${index + 1}. **${username}:** $${balance}`;
    })
    .join("\n");

  return interaction.reply("**Global Leaderboard:**\n" + leaderboardString);
}

async function getNetWorthLeaderboardSlash(interaction) {
  try {
    const users = await User.find();
    if (!users.length) {
      return interaction.reply("No leaderboard data available.");
    }

    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        let totalNetWorth = { USD: user.balance };

        const otherStocks = user.stocks.filter((stock) => stock.symbol !== "KGB");
        for (const stock of otherStocks) {
          const currentPrice = await fetchStockPrice(stock.symbol);
          const stockCurrency = await fetchStockCurrency(stock.symbol);

          if (currentPrice && stockCurrency) {
            const stockValue = currentPrice * stock.amount;
            if (!totalNetWorth[stockCurrency]) totalNetWorth[stockCurrency] = 0;
            totalNetWorth[stockCurrency] += stockValue;
          }
        }

        const kgbStock = user.stocks.find((stock) => stock.symbol === "KGB");
        if (kgbStock) {
          const kgbData = await KingBotStock.findOne({ symbol: "KGB" });
          if (kgbData) {
            const kgbValue = kgbData.price * kgbStock.amount;
            if (!totalNetWorth[kgbData.currency]) totalNetWorth[kgbData.currency] = 0;
            totalNetWorth[kgbData.currency] += kgbValue;
          }
        }

        const totalUSDNetWorth = totalNetWorth["USD"] || 0;
        return { username: user.username || `Unknown User (${user.discordId})`, netWorth: totalUSDNetWorth };
      })
    );

    leaderboardData.sort((a, b) => b.netWorth - a.netWorth);

    if (!leaderboardData.length) {
      return interaction.reply("No leaderboard data available.");
    }

    const leaderboardString = leaderboardData
      .slice(0, 10)
      .map((entry, index) => `${index + 1}. **${entry.username}:** $${entry.netWorth.toFixed(2)}`)
      .join("\n");

    return interaction.reply("**Global Leaderboard (Net Worth):**\n" + leaderboardString);
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return interaction.reply("Error generating leaderboard. Please try again later.");
  }
}

//Temporary
client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$human")) {
    message.reply(
      "The `$human` command has been relocated to `$chat`. Please use `$chat (prompt)` to interact with Gemini Chat."
    );
  }
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("$adminstartping")) {
    if (
      ![
        "786745378212282368"
      ].includes(message.author.id)
    ) {
      message.reply("You are not authorized to use this command.");
      return;
    }

    const pingInterval = 1100;
    const usersToPing = [
      "961083467469291590",
      "1182066230715224188",
      "1183257700415578174",
      "1249160827777318987",
      "818622068899315762",
      "1233218917078532237",
      "1253105559373353024",
      "1249013591642996890",
    ];

    let currentIndex = 0;
    let pinging = true;

    const pingIntervalId = setInterval(() => {
      if (!pinging) {
        clearInterval(pingIntervalId);
        return;
      }

      const pingedUserId = usersToPing[currentIndex];
      const pingedUser = client.users.cache.get(pingedUserId);
      if (pingedUser) {
        message.reply(`${pingedUser} you've been pinged!`);
      }

      currentIndex = (currentIndex + 1) % usersToPing.length;
    }, pingInterval);

    client.on("messageCreate", async (stopMessage) => {
      if (
        stopMessage.content === "$stopping" &&
        [
          "786745378212282368",
          "737353026976612374",
          "811976354568208404",
        ].includes(stopMessage.author.id)
      ) {
        pinging = false;
        clearInterval(pingIntervalId);
        stopMessage.reply("Stopped pinging users.");
        client.off("messageCreate", stopMessage);
      }
    });
  }
});

//Keep at bottom.
initializeKGBStock().then(updateKGBPrice);

(async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(process.env.MONGODB_URI, { connectTimeoutMS: 60000 });
    console.log("Connected to DB.");

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();