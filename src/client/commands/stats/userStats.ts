import * as moment from 'moment';
import { Command } from '@yamdbf/core';
import {
	GuildMember,
	Role,
	Message,
	MessageEmbed,
	Collection
} from 'discord.js';
import Statuses from '../../../lib/enums/Statuses';
import constants from '../../../lib/Constants';

export default class Stats extends Command {
	public constructor() {
		super({
			name: 'stats',
			desc: 'User Discord Stats',
			usage: '<prefix>stats',
			info: 'This command returns information regarding your Discord presence.',
			group: 'stats',
			guildOnly: true
		});
	}

	public async action(message: Message): Promise<void> {
		message.channel.startTyping();

		if (message.member === null) {
			message.channel.send(
				'Please login in order to check your Discord stats.'
			);
			return message.channel.stopTyping();
		}

		const guildMember: GuildMember = message.member;
		const status: string = guildMember.user.presence.status;
		const joinDiscord =
			`${moment(guildMember.user.createdAt).format('lll')}` +
			`\n*${moment(new Date()).diff(
				guildMember.user.createdAt,
				'days'
			)} days ago*`;
		let joinServer: string;
		const accurateRoles: Role[] = [];

		if (guildMember.joinedAt)
			joinServer =
				`${moment(guildMember.joinedAt).format('lll')}` +
				`\n*${moment(new Date()).diff(guildMember.joinedAt, 'days')} days ago*`;
		else joinServer = 'Unknown';

		const userRoles = new Collection(
			Array.from(message.member.roles.entries()).sort(
				(a: [string, Role], b: [string, Role]): number =>
					b[1].position - a[1].position
			)
		);

		const rolesNoBots = userRoles.filter(
			(r: Role): boolean => r.name !== '@everyone' && r.managed === false
		);

		rolesNoBots.forEach((role: Role): void => {
			accurateRoles.push(role);
		});

		const embed: MessageEmbed = new MessageEmbed()
			.setColor(constants.embedColorBase)
			.setAuthor(
				`${guildMember.user.username}#${guildMember.user.discriminator}`
			)
			.setThumbnail(
				guildMember.user.avatarURL() || guildMember.user.defaultAvatarURL
			)
			.addField('Joined Server', joinServer, true)
			.addField('Joined Discord', joinDiscord, true)
			.addField('Roles', `${accurateRoles.join(', ')}`, false)
			.setFooter(
				`${guildMember.user.username} is currently ${
					Statuses[status as string]
				}.`
			);

		message.channel.send(embed);

		return message.channel.stopTyping();
	}
}
