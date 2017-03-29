'use strict';

import { Bot, Command, RateLimit } from 'yamdbf';
import { Message, MessageReaction, RichEmbed, Role, User } from 'discord.js';
import * as fs from 'fs';
import * as fuzzy from 'fuzzy';
import Constants from '../../util/constants';
import Nerd from '../../util/nerd';
import Term from '../../util/term';

export default class BelterWordSearch extends Command<Bot>
{
    public constructor(bot: Bot)
    {
        super(bot, {
            name: 'fc',
            description: 'Belta Flashcard',
            usage: '<prefix>fc',
            extraHelp: '',
            group: 'dictionary',
            guildOnly: true,
            ratelimit: '1/10s'
        });

        const rateLimit = new RateLimit([1, 10e3]);
        this.use((message, args) => { if (rateLimit.call()) return [message, args]; });
    }

    public async action(message: Message, args: string[]): Promise<any>
    {
        // variable declaration
        let guildStorage: any = this.bot.guildStorages.get(Constants.guildID);
        const belter: Array<Term> = guildStorage.getItem('BeltaTerms');
        let term: Term = belter[Math.floor(Math.random() * belter.length)];
        let userReaction: boolean = false;

        if (term.definition == '--')
            term = belter[Math.floor(Math.random() * belter.length)];

        let terms: Array<Term> = new Array();
        let index: number = 0;

        // need better random for remaining terms, potential exists for duplicates
        terms.push(term);
        terms.push(belter[Math.floor(Math.random() * belter.length)]);
        terms.push(belter[Math.floor(Math.random() * belter.length)]);
        terms.push(belter[Math.floor(Math.random() * belter.length)]);

        let currentIndex: number = terms.length;
        let temporaryValue: Term = new Term();
        let randomIndex: number = 0;

        while (0 !== currentIndex)
        {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            
            temporaryValue = terms[currentIndex];
            terms[currentIndex] = terms[randomIndex];
            terms[randomIndex] = temporaryValue;
        }

        index = terms.findIndex((t: Term) => { return t.term === term.term; });

        let m: Message = await Nerd.flashcardMessage(message, terms, index);

        setTimeout(() => {
            m.clearReactions();
            if (!userReaction)
                return message.channel.sendMessage('Time expired, the correct term was *' + term.term + '*.');
        }, 10e3);

        const re: RegExp = new RegExp((index + 1).toString(), 'i');

        this.bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
            if (reaction.message.id === m.id)
            {  
                if (user.id === message.author.id)
                {
                    if (reaction.emoji.name.match(re))
                    {
                        userReaction = true;
                        m.clearReactions();
                        return message.channel.sendMessage('Yes, *' + term.term + '*  is correct!');
                    }
                    else
                    {
                        userReaction = true;
                        m.clearReactions();
                        return message.channel.sendMessage('You are incorrect, the correct term was *' + term.term + '*.');
                    }
                }
                else
                {
                    if (reaction.emoji.name.match(re))
                    {
                        userReaction = true;
                        m.clearReactions();
                        return message.channel.sendMessage(user.toString() + ' beat you to the punch! *' + term.term + '*  is correct!')
                    }
                }
            }
        });
    }
};
