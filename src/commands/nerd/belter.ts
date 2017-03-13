'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import Term from '../../util/term'

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
        // term list
        const belter = JSON.parse(fs.readFileSync('data/belter.json').toString());

        // serach for term
        let options: any = { extract: (el: any) => { return el.term; } };
        let results: Array<any> = fuzzy.filter(args.join(' '), belter, options);

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

            // display the embed
            return message.channel.sendEmbed(embed, '', { disableEveryone: true });
        }

        if (results.length >= 2)
        {
            const re: RegExp = new RegExp('noun|verb|adjective', 'ig');
            let part: string = '';
            const filter: any = (m: Message) => {
                
                 if (m.author.id === message.author.id && m.content.match(re))
                 {
                    part = m.content.toLowerCase();
                    return m.content;
                 }                    
            };
            // are they all the same term?
            if (Term.sameTerms(results))
            {
                message.channel.sendMessage(`This term has more than one part of speech: \`${results.map((el: any) => { return el.original.partOfSpeech; }).join('\`, \`')}\`. Please specifiy which one you meant.`)
                    .then(() => {
                        message.channel.awaitMessages(filter, {
                            max: 1,
                            time: 7000,
                            errors: ['time'],
                        }
                    )
                    .then((collected) => {
                        let termResult: Term = new Term();
                        let x = 0;
                        while (x < results.length)
                        {
                            if (results[x].original.partOfSpeech.toLowerCase() == part)
                                termResult = results[x].original;
                            x++;
                        }

                        // build the output embed
                        let termEmbed: RichEmbed = new RichEmbed()
                            .setColor(0x274E13)
                            .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
                            .addField(termResult.term, '*' + termResult.pronounciation + '*',  true)
                            .addField('Part of Speech', termResult.partOfSpeech, true)
                            .addField('\u200b', '\u200b', true)
                            .addField('Definition', termResult.definition, true)
                            .addField('Usage', termResult.usage, true)
                            .addField('\u200b', '\u200b', true)
                            .addField('Etymology', termResult.etymology, false)
                            .setTimestamp();

                        // display the embed
                        message.channel.sendEmbed(termEmbed, '', { disableEveryone: true });
                    })
                    .catch(() => {
                        message.channel.sendMessage('There was no part of speech specified within the time limit.');
                    });
                });
            }
            else
            {
                // be more specific
                let distinctTerms: Array<string> = new Array();

                let x = 0;
                while (x < results.length)
                {
                    if (distinctTerms.indexOf(results[x].original.term) === -1)
                        distinctTerms.push(results[x].original.term);
                    x++;
                }
                
                return message.channel.sendMessage(`More than one term found: \`${distinctTerms.join('\`, \`')}\`.  Please re-run the command and be more specific.`);
            }                
        }
    }
}