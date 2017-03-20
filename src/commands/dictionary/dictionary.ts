'use strict';

import { Bot, Command } from 'yamdbf';
import { GuildMember, Message, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import * as gapi from 'googleapis';
import Google from '../../util/google';
import Term from '../../util/term';

export default class DisekowtelowdaDictionary extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'DisekowtelowdaDictionary',
            aliases: ['dd'],
            description: 'A small dictionary of Belta terms.',
            usage: '<prefix>d',
            group: 'dictionary',
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
            // error checking
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
                        console.log('No data found.');
                    
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


                    }
                });
            });
        });
    }
};
