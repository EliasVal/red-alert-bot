import 'dotenv/config';

import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { getCities } from './src/cities';
import axios from 'axios';
import { AlertHistory } from './src/alert';
import { THREATS } from './src/threats';
import { getAnnouncementChannel } from './src/announcement-channel';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on('ready', () => console.log('🎉 Bot Ready!'));
await client.login(process.env.TOKEN);

const announcementChannel = await getAnnouncementChannel(client);

let lastAlertId = -1;
let lastAlertTime = -1;

const cities = await getCities();

async function Announce() {
  // const allAlerts = JSON.parse(await readFileSync('./testing.json'));

  let allAlerts: AlertHistory;

  try {
    const res = await axios.get<AlertHistory>('https://api.tzevaadom.co.il/alerts-history/');
    allAlerts = res.data;
  } catch {
    allAlerts = [{ id: -1, alerts: [] }];
  }

  if (lastAlertId == -1) {
    lastAlertTime = allAlerts[0].alerts[allAlerts[0].alerts.length - 1].time;
    lastAlertId = allAlerts[0].id;
  }

  if (allAlerts[0].id >= lastAlertId && allAlerts[0].id != -1) {
    const alerts = allAlerts.filter((alert) => alert.id >= lastAlertId);

    for (const alert of alerts) {
      let msg = '';
      for (const a of alert.alerts) {
        if (a.threat == 9) continue;
        if (a.isDrill) continue;
        if (a.time <= lastAlertTime) continue;

        msg += `${THREATS[a.threat]} - [${new Date(a.time * 1000).toLocaleTimeString('he-IL', {
          timeZone: 'Israel',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })}]:\n${a.cities.map((city) => cities[city].en).join(', ')}\n\n`;

        lastAlertTime = a.time;
      }

      if (msg == '') continue;

      const embed = new EmbedBuilder();
      embed.setColor('DarkRed');
      embed.setTitle('Sirens in Israel');
      embed.setDescription(msg);
      const m = await announcementChannel!.send({ embeds: [embed] });

      if (m.crosspostable) m.crosspost();
    }
    lastAlertId = allAlerts[0].id;
  }
}

setInterval(Announce, parseInt(process.env.INTERVAL!));

export {};
