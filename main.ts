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
      break;
  }
});

// let lastAlertId = -1;
// let lastAlertTime = -1;

// async function Announce() {
//   // const allAlerts = JSON.parse(await readFileSync('./testing.json'));

//   let allAlerts: AlertHistory;

//   try {
//     const res = await axios.get<AlertHistory>('https://api.tzevaadom.co.il/alerts-history/');
//     allAlerts = res.data;
//   } catch {
//     allAlerts = [{ id: -1, alerts: [] }];
//   }

//   if (lastAlertId == -1) {
//     lastAlertTime = allAlerts[0].alerts[allAlerts[0].alerts.length - 1].time;
//     lastAlertId = allAlerts[0].id;
//   }

//   if (allAlerts[0].id >= lastAlertId && allAlerts[0].id != -1) {
//     const alerts = allAlerts.filter((alert) => alert.id >= lastAlertId);

//     for (const alert of alerts) {
//       let msg = '';
//       for (const a of alert.alerts) {
//         if (a.threat == 9) continue;
//         if (a.isDrill) continue;
//         if (a.time <= lastAlertTime) continue;

// msg += `${THREATS[a.threat]} - [${new Date(a.time * 1000).toLocaleTimeString('he-IL', {
//   timeZone: 'Israel',
//   hour: '2-digit',
//   minute: '2-digit',
//   hour12: false,
// })}]:\n${a.cities.map((city) => cities[city].en).join(', ')}\n\n`;

//         lastAlertTime = a.time;
//       }

//       if (msg == '') continue;

//       const embed = new EmbedBuilder();
//       embed.setColor('DarkRed');
//       embed.setTitle('Sirens in Israel');
//       embed.setDescription(msg);
//       const m = await announcementChannel.send({ embeds: [embed] });

//       if (m.crosspostable) m.crosspost();
//     }
//     lastAlertId = allAlerts[0].id;
//   }
// }

// setInterval(Announce, parseInt(process.env.INTERVAL!));
