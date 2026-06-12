import { EmbedBuilder, type Message, type SendableChannels } from 'discord.js';
import type { AlertMessage } from './socket-message.ts';
import type { CitiesResponse, City } from './cities.ts';
import { THREATS } from './threats.ts';

let embed: EmbedBuilder | null;
let message: Message | null;

let processedAlertIds: string[] = [];
let activeCities: Map<string, Alert> = new Map();

export async function handleAlert(
  channel: SendableChannels,
  alertMessage: AlertMessage,
  citiesMap: CitiesResponse,
): Promise<void> {
  const { data } = alertMessage;

  data.threat ??= 8;

  if (data.isDrill) return;
  if (processedAlertIds.includes(data.notificationId)) return;

  processedAlertIds.push(data.notificationId);
  if (processedAlertIds.length > 100) processedAlertIds.shift();

  const cities = data.cities
    .filter((city) => !activeCities.has(city))
    .map((city) => ({ key: city, ...citiesMap.cities[city] }));

  if (!cities.length) return;

  embed ??= new EmbedBuilder().setTitle('Red Alerts').setColor('DarkRed');

  cities.forEach((city) => {
    activeCities.set(city.key, new Alert(data.threat, city, data.time));
  });

  const alertGroups = Object.groupBy(activeCities.values(), (alert) => alert.threat);
  const time = new Date(data.time * 1000).toLocaleTimeString('he-IL', {
    timeZone: 'Israel',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const description = Object.entries(alertGroups)
    .map(([threat, alerts]) => {
      const areaGroups = Object.groupBy(alerts, (alert) => citiesMap.areas[alert.city.area].en);

      return `${THREATS[Number(threat) as keyof typeof THREATS]} - [${time}]:\n${Object.entries(areaGroups)
        .map(([area, alerts]) => `\`${area}\` - ${(alerts ?? []).map((alert) => alert.city.en).join(', ')}`)
        .join('\n')}`;
    })
    .join('\n\n');

  embed.setDescription(description);

  try {
    if (message) {
      message.edit({ embeds: [embed] });
    } else {
      message = await channel.send({ embeds: [embed] });
      if (message.crosspostable) message.crosspost();
    }
  } catch (e) {
    console.error(`Sending/Editing Message failed: ${e}`);
  }
}

function clearCities() {
  const citiesToRemove = activeCities
    .entries()
    .filter(([key, alert]) => alert.time * 1000 + alert.city.countdown < Date.now())
    .map(([key, value]) => key);

  citiesToRemove.forEach((city) => activeCities.delete(city));

  if (!activeCities.size) {
    embed = null;
    message = null;
  }
}

setInterval(clearCities, 1000);

class Alert {
  threat;
  city;
  time;

  constructor(threat: keyof typeof THREATS, city: City, time: number) {
    this.threat = threat;
    this.city = city;
    this.time = time;
  }
}
