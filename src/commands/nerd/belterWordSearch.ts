'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import * as gapi from 'googleapis';
import Google from '../../util/google';
import Term from '../../util/term';

export default class BelterWordSearch extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'BelterWordSearch',
            aliases: ['bt'],
            description: 'A small dictionary of Belta terms.',
            usage: '<prefix>bt <Belta Term>',
            group: 'nerd',
            guildOnly: true
        });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        let g: Google = new Google();
        let belter: Array<Term> = new Array();

        // read in google info
        fs.readFile('client_secret.json', function processClientSecrets(err: NodeJS.ErrnoException, content: Buffer)
        {
            if (err)
                return console.log('Error loading client secret file: ' + err);
            
            // authorize and access content
            g.authorize(JSON.parse(content.toString()), function(auth: any)
            {
                // grab the Belter Creole GoogleSheet
                let sheets: any = gapi.sheets('v4');
                sheets.spreadsheets.values.get(
                {
                    auth: auth,
                    spreadsheetId: '1RCnWC3lQLmyo6P1IbLFB0n4x07d-oB5VqKxjv0R-EzY',
                    range: 'Terms!A2:F',
                },
                function(err: any, response: any)
                {
                    // error checking
                    if (err)
                        return console.log('The API returned an error: ' + err);

                    // grab the data
                    var rows: any = response.values;

                    // make sure there is data
                    if (rows.length == 0)
                        return console.log('No data found.');

                    // there is data
                    else
                    {
                        // build the term array
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
                        
                        // if single term found
                        if (results.length === 1)
                        {
                            let termResult: Term = results[0].original;
                            Term.sendTerm(message, termResult);
                        }

                        // if multiple terms found
                        if (results.length >= 2)
                        {
                            // is the query specifically typed?
                            if (Term.isSpecificResult(results, args.join(' ')))
                            {
                                // variable declaration
                                let termResults: Array<Term> = Term.getSpecificResults(results, args.join(' '));

                                // if single term found
                                if (termResults.length === 1)
                                    return Term.sendTerm(message, termResults[0]);
                                
                                // define parts of speech
                                const partsOfSpeech: Array<string> = [
                                    'Adjective',
                                    'Adverb',
                                    'Article',
                                    'Auxiliary Verb',
                                    'Bound Morpheme',
                                    'Conjunction',
                                    'Determiner',
                                    'Interjection',
                                    'Noun',
                                    'Noun Phrase',
                                    'Number',
                                    'Particle',
                                    'Phrase',
                                    'Prefix',
                                    'Preposition',
                                    'Pronoun',
                                    'Proper Noun',
                                    'Quantifier',
                                    'Suffix',
                                    'Tag Question',
                                    'Verb',
                                    'Verb Phrase',
                                ];
                                const re: RegExp = new RegExp(partsOfSpeech.join('|'), 'ig');
                                let part: string = '';

                                // create confirmation filter
                                const filter: any = (m: Message) => {
                                    if (m.author.id === message.author.id && m.content.match(re))
                                    {
                                        part = m.content.toLowerCase();
                                        return m.content;
                                    }                    
                                };

                                // send confirmation message
                                message.channel.sendMessage(`This term has more than one part of speech: \`${termResults.map((el: any) => { return el.partOfSpeech; }).join('\`, \`')}\`. Please specifiy which one you meant.`)
                                    // wait for response
                                    .then(() => {
                                        message.channel.awaitMessages(filter, {
                                            max: 1,
                                            time: 7000,
                                            errors: ['time'],
                                        }
                                    )
                                    // collect response
                                    .then((collected) => {
                                        // variable declaration
                                        let termResult: Term = new Term();

                                        // grab the term based on user input
                                        let x = 0;
                                        while (x < termResults.length)
                                        {
                                            if (termResults[x].partOfSpeech.toLowerCase() == part)
                                                termResult = termResults[x];
                                            x++;
                                        }

                                        // display definition
                                        return Term.sendTerm(message, termResult);
                                    })
                                    // user failed to input in the alotted time
                                    .catch(() => {
                                        return message.channel.sendMessage('There was no part of speech specified within the time limit.');
                                    });
                                });
                            }

                            // be more specific
                            else
                            {
                                // variable declaration
                                let distinctTerms: Array<string> = new Array();

                                // build distinct term list for error message
                                let x = 0;
                                while (x < results.length)
                                {
                                    if (distinctTerms.indexOf(results[x].original.term) === -1)
                                        distinctTerms.push(results[x].original.term);
                                    x++;
                                }
                                
                                // return error message
                                return message.channel.sendMessage(`More than one term found: \`${distinctTerms.join('\`, \`')}\`.  Please re-run the command and be more specific.`);
                            }
                        }
                    }
                });
            });
        });
    }
};
