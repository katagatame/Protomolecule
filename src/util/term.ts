'use strict'

import { Message, RichEmbed } from 'discord.js';
import * as fs from 'fs';
import * as gapi from 'googleapis';
import Constants from '../util/constants';
import Google from '../util/google';

export default class Term
{
    public term: string;
    public pronunciation: string;
    public partOfSpeech: string;
    public definition: string;
    public usage: string;
    public etymology: string;

    public static updateTerms(guildStorage: any): boolean
    {
        //variable declaration
        let error: boolean = false;

        // read in google info
        fs.readFile('client_secret.json', function processClientSecrets(err: NodeJS.ErrnoException, content: Buffer)
        {
            // error checking
            if (err)
            {
                error = true;
                console.log('Error loading client secret file: ' + err);
            }

            // authorize and access content
            new Google().authorize(JSON.parse(content.toString()), function(auth: any)
            {
                // grab the Belter Creole GoogleSheet
                let sheets: any = gapi.sheets('v4');
                sheets.spreadsheets.values.get(
                {
                    auth: auth,
                    spreadsheetId: Constants.beltaSpreadSheetID,
                    range: 'Terms!A2:F',
                },
                function(err: any, response: any)
                {
                    // error checking
                    if (err)
                    {
                        error = true;
                        console.log('The API returned an error: ' + err);
                    }
                        

                    // grab the data
                    var rows: any = response.values;

                    // make sure there is data
                    if (rows.length == 0)
                    {
                        error = true;
                        console.log('No data found.');
                    }

                    // there is data
                    else
                    {
                        // build the term array
                        let belter: Array<Term> = new Array();
                        for (var i: number = 0; i < rows.length; i++)
                        {
                            let row: any = rows[i];
                            let t: Term = new Term();

                            t.term = row[0];
                            t.definition = row[1];
                            t.pronunciation = row[2];
                            t.usage = row[3];
                            t.partOfSpeech = row[4];
                            t.etymology = row[5];

                            belter.push(t);
                        }

                        // save term list
                        guildStorage.setItem('BeltaTerms', belter);
                    }
                });
            });
        });
        return error;
    }

    public static sendTerm(message: Message, term: Term): Promise<any>
    {
        const embed: RichEmbed = new RichEmbed()
            .setColor(0x206694)
            .setAuthor('Disekowtalowda Dictionary', Constants.guildIconURL)
            .setDescription('**' + term.term + '**  *' +
                term.pronunciation.replace('--', '\u200b') + '*\n' +
                term.partOfSpeech.replace('--', '\u200b').toLowerCase() + '\n\n' +
                term.definition.replace('\\n\\n', '\u000d'))
            .addField('Etymology', term.etymology.replace('\\n\\n', '\u000d').replace('--', '*no etymology information, yet...*'));
        return message.channel.sendEmbed(embed, '', { disableEveryone: true });
    }

    public static isSpecificResult(array: Array<any>, item: string): boolean
    {
        if (array === null) return false;
        return Boolean(array.find(a => a.original.term === item));
    }

    public static getSpecificResults(array: Array<any>, item: string): Array<Term>
    {
        let results: Array<Term> = new Array();
        array.forEach((el: any) => {
            if (el.original.term === item)
                results.push(el.original);
        });
        return results;
    }

    public static getCharacterListString(): string
    {
        let cList: string = '';
        Constants.characterList.forEach((el: any) => {
            cList += `\`Alt\` + \`` + el[1] + `\` = \`` + el[0] + `\`\n`;
        });
        return cList;
    }

    public static getCharacterList(): Array<string>
    {
        return Constants.characterList.map((el: any) => { return el[0]; });
    }

    public static getShortcutList(): Array<string>
    {
        return Constants.characterList.map((el: any) => { return el[1]; });
    }
};
