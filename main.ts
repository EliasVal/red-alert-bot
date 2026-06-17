import 'dotenv/config';
envCheck();

import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { getAnnouncementChannel } from './src/announcement-channel.ts';
import { getCities } from './src/cities.ts';
import { envCheck } from './src/env-check.ts';
import type { SocketMessage } from './src/socket-message.ts';
import { handleAlert } from './src/alert.ts';
import { connect } from './src/ws.ts';

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

connect((data) => {
  let m: SocketMessage;
  try {
    m = JSON.parse(data.toString());
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
    return;
  }

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
