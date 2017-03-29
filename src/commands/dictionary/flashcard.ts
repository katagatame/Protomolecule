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
            extraHelp: 'This command generates a flashcard of a random Belta term\'s definition and provide four(4) reactions for you to respond to.\u000d\u000d*Each reaction is associated with an answer to the flashcard.\u000d\u000d*Click on the appropriate reaction to answer.\u000d\u000d*You will have ten(10) seconds to respond.',
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
        let pool: Array<number> = new Array(belter.length);
        let term: Term = belter[Math.floor(Math.random() * belter.length)];
        let terms: Array<Term> = new Array();
        let index: number = 0;
        let userReaction: boolean = false;

        // if there is no definition, grab another
        if (term.definition == '--')
            term = belter[Math.floor(Math.random() * belter.length)];
        
        // build array of numbers to choose from
        for (let x: number = 0; x < pool.length; x++)
        {
            pool[x] = (x + 1);
        }

        // first random term
        let a: number = Math.floor(Math.random() * pool.length);
        pool.splice(a, 1);

        // second random term
        let b: number = pool[Math.floor(Math.random() * pool.length)];
        pool.splice(b, 1);

        // third random term
        let c: number = pool[Math.floor(Math.random() * pool.length)];
        
        // build term array for flashcard
        terms.push(term);
        terms.push(belter[a]);
        terms.push(belter[b]);
        terms.push(belter[c]);

        // randomize the terms
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

        // find the corect term
        index = terms.findIndex((t: Term) => { return t.term === term.term; });

        // send the flashcard
        let m: Message = await Nerd.flashcardMessage(message, terms, index);

        // 10 second timer
        setTimeout(() => {
            m.clearReactions();
            if (!userReaction)
                return message.channel.sendMessage('Time expired, the correct term was *' + term.term + '*.');
        }, 10e3);

        // regex for correct response
        const re: RegExp = new RegExp((index + 1).toString(), 'i');

        // listen for reactions
        this.bot.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
            // is the raction on our flashcard?
            if (reaction.message.id === m.id)
            {  
                // was it the command issuer?
                if (user.id === message.author.id)
                {
                    // did they answer correctly?
                    if (reaction.emoji.name.match(re))
                    {
                        userReaction = true;
                        m.clearReactions();
                        return message.channel.sendMessage('Yes, *' + term.term + '*  is correct!');
                    }

                    // no they didn't
                    else
                    {
                        userReaction = true;
                        m.clearReactions();
                        return message.channel.sendMessage('You are incorrect, the correct term was *' + term.term + '*.');
                    }
                }

                // no it wasn't
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
