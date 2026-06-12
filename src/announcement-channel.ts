import { type Client, type SendableChannels } from 'discord.js';

export async function getAnnouncementChannel(client: Client): Promise<SendableChannels> {
  const announcementChannel = await client.channels.fetch(process.env.ANNOUNCE_CHANNEL!);
  if (!announcementChannel) throw new Error('Announcement channel does not exist!');
  if (announcementChannel.isDMBased()) throw new Error('Announcement channel must be in a guild!');
  if (!(announcementChannel.isSendable() && announcementChannel.isTextBased()))
    throw new Error('Announcement channel must be text-based!');

  return announcementChannel;
}
