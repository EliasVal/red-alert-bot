import 'dotenv/config';
envCheck();

import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { getAnnouncementChannel } from './src/announcement-channel.ts';
import { getCities } from './src/cities.ts';
import { envCheck } from './src/env-check.ts';
import { io } from 'socket.io-client';
import type { SocketMessage } from './src/socket-message.ts';
import { handleAlert } from './src/alert.ts';

const socketClient = io('wss://ws.tzevaadom.co.il/socket');

const cities = await getCities();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
client.once('clientReady', () => {
  client.user?.setPresence({
    status: 'online',
    activities: [
      {
        name: 'Watching over the skies',
        type: ActivityType.Custom,
      },
    ],
  });
  console.log('🎉 Bot Ready!');
});
await client.login(process.env.TOKEN);

const announcementChannel = await getAnnouncementChannel(client);

socketClient.on('message', (m: SocketMessage) => {
  switch (m.type) {
    case 'ALERT':
      handleAlert(announcementChannel, m, cities);
      break;
    case 'SYSTEM_MESSAGE':
      // TODO
      // This mostly has early warnings about incoming missiles.
      break;
  }
});
