'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import * as gapi from 'googleapis';
import Google from '../../util/google';
import Term from '../../util/term';

export default class googleTest extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'googleTest',
            aliases: ['gt'],
            description: 'google test.',
            usage: '<prefix>gt',
            group: 'nerd',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        let g: Google = new Google();
        let belter: Array<Term> = new Array();

        fs.readFile('client_secret.json', function processClientSecrets(err: NodeJS.ErrnoException, content: Buffer)
        {
            if (err)
                return console.log('Error loading client secret file: ' + err);
            
            g.authorize(JSON.parse(content.toString()), function(auth: any)
            {
                let sheets: any = gapi.sheets('v4');
                sheets.spreadsheets.values.get(
                {
                    auth: auth,
                    spreadsheetId: '1RCnWC3lQLmyo6P1IbLFB0n4x07d-oB5VqKxjv0R-EzY',
                    range: 'Terms!A2:F',
                },
                function(err: any, response: any)
                {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        return;
                    }
                    var rows: any = response.values;
                    if (rows.length == 0)
                        console.log('No data found.');
                    else
                    {
                        for (var i: number = 0; i < rows.length; i++)
                        {
                            let row: any = rows[i];
                            let t: Term = new Term();

                            t.term = row[0];
                            t.definition = row[1];
                            t.pronounciation = row[2];
                            t.usage = row[3];
                            t.partOfSpeech = row[4];
                            t.etymology = row[5];

                            belter.push(t);
                        }

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
                            if (Term.isSpecificResult(results, args.join(' ')))
                            {
                                let termResult: Term = Term.getSpecificResult(results, args.join(' ')).original;

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
                            }
                            else if (Term.sameTerms(results))
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
                });
            });
        });
    }
}