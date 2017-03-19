'use strict'

import { Message, RichEmbed } from 'discord.js';

export default class Term
{
    public term: string;
    public pronounciation: string;
    public partOfSpeech: string;
    public definition: string;
    public usage: string;
    public etymology: string;

    public static sendTerm(message: Message, term: Term): Promise<any>
    {
        const embed: RichEmbed = new RichEmbed()
            .setColor(0x274E13)
            .setAuthor('Disekowtalowda Dictionary', message.guild.iconURL)
            .addField('Term', term.term + ' *' + term.pronounciation.replace('--', '\u200b') + '*',  false)
            .addField('Part of Speech', term.partOfSpeech, true)
            .addField('\u200b', '\u200b', true)
            .addField('Usage', term.usage, true)
            .addField('Definition', term.definition.replace('\\n\\n', '\u000d'), false)
            .addField('Etymology', term.etymology.replace('\\n\\n', '\u000d').replace('--', '*no etymology information, yet...*'), false)            
            .setTimestamp();
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
};