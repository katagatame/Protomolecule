'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import Term from '../../util/term'
import { prompt, PromptResult } from '../../util/prompt';

export default class Dictionary extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'Dictionary',
            aliases: ['dt'],
            description: 'test.',
            usage: '<prefix>dt',
            group: 'nerd',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {    
        const belter = JSON.parse(fs.readFileSync('data/belter.json').toString());

        // serach for term
        let options: any = { extract: (el: any) => { return el.term; } };
        let results: any = fuzzy.filter(args.join(' '), belter, options);

        // check if term exists
        if (results.length === 0)
            return message.channel.sendMessage(`\`${args.join(' ')}\` is not a valid term.`);
        
        // check if term exists
        if (results.length === 1)
        {
            let result: Term = results[0].original;

            // build the output embed
            const embed: RichEmbed = new RichEmbed()
                .setColor(0x274E13)
                .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
                .addField(result.term, '*' + result.pronounciation + '*',  true)
                .addField('Part of Speech', result.partOfSpeech, true)
                .addField('\u200b', '\u200b', true)
                .addField('Definition', result.definition, true)
                .addField('Usage', result.usage, true)
                .addField('\u200b', '\u200b', true)
                .addField('Etymology', result.etymology, false)
                .setTimestamp();

            return message.channel.sendEmbed(embed, '', { disableEveryone: true });
        }

        if (results.length >= 2)
        {
            if (Term.isSpecificTerm(results, args.join(' ')))
            {
               let result: Term = results[0].original;

                // build the output embed
                const embed: RichEmbed = new RichEmbed()
                    .setColor(0x274E13)
                    .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
                    .addField(result.term, '*' + result.pronounciation + '*',  true)
                    .addField('Part of Speech', result.partOfSpeech, true)
                    .addField('\u200b', '\u200b', true)
                    .addField('Definition', result.definition, true)
                    .addField('Usage', result.usage, true)
                    .addField('\u200b', '\u200b', true)
                    .addField('Etymology', result.etymology, false)
                    .setTimestamp();

                return message.channel.sendEmbed(embed, '', { disableEveryone: true });
            }
            else
            {
                return message.channel.sendMessage(`More than one term found: \`${results.map((el: any) => {return el.original.term}).join(', ')}\`,  please be more specific.`);}
            }
        }
    }
}