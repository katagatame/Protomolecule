import Admin from '../../../src/lib/util/Admin';
import { MessageEmbed } from 'discord.js';

describe('Util: Admin', (): void => {
	test('Create Reaction Message - Books', async (): Promise<void> => {
		let embed: MessageEmbed = await Admin.createReactionMessage('b');
		expect(embed.author!.name).toBe('The Expanse -- Book Exposure');
	});

	test('Create Reaction Message - Show', async (): Promise<void> => {
		let embed: MessageEmbed = await Admin.createReactionMessage('s');
		expect(embed.author!.name).toBe('The Expanse -- Show Exposure');
	});
});
