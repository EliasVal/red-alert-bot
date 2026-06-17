import 'dotenv/config';
envCheck();

import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { getAnnouncementChannel } from './src/announcement-channel.ts';
import { getCities } from './src/cities.ts';
import { envCheck } from './src/env-check.ts';
import { io } from 'socket.io-client';
import type { SocketMessage } from './src/socket-message.ts';
import { handleAlert } from './src/alert.ts';

const socketClient = io('wss://ws.tzevaadom.co.il/socket?platform=WEB', {
  agent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
});

socketClient.on('connect', () => {
  console.log('Socket connected!');
});

socketClient.on('connect_error', (error) => {
  if (socketClient.active) {
    // temporary failure, the socket will automatically try to reconnect
  } else {
    console.log(`Socket connect error: ${error.message}`);
  }
});

socketClient.on('disconnect', (reason, details) => {
  console.log('Socket disconnected!');
  console.log(`Reason: ${reason}`);
  console.log(`Details: ${JSON.stringify(details)}`);

  socketClient.connect();
});

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
