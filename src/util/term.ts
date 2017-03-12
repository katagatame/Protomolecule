'use strict'

export default class Term
{
    public term: string;
    public pronounciation: string;
    public partOfSpeech: string;
    public definition: string;
    public usage: string;
    public etymology: string;

    public static isSpecificTerm(array: any, item: string): boolean
    {
        if (array === null) return false;
        return Boolean(array.find(a => a.original.term === item));
    }
};