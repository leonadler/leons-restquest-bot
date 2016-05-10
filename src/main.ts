import { install as sourcemapSupport } from 'source-map-support';
sourcemapSupport({ handleUncaughtExceptions: false });

import { Bot } from './bot';
import { RestClient } from './rest-client';

const urlBase = process.argv[2] || 'http://localhost:3000';
const botName = 'doombot-' + (Math.random() * 100 | 0);
process.title = botName;
const client: RestClient = new RestClient(urlBase, botName);

const bot = new Bot(client);

bot.startGame();
