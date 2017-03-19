'use strict'

export default class Term
{
    public term: string;
    public pronounciation: string;
    public partOfSpeech: string;
    public definition: string;
    public usage: string;
    public etymology: string;

    public static sameTerms(array: Array<any>): boolean
    {
        if (array === null) return false;
        let x = 0;
        while (x < array.length)
        {
            if (array[x].original.term !== array[0].original.term)
                return false;
            x++;
        }
        return true;
    }

    public static isSpecificResult(array: Array<any>, item: string): boolean
    {
        if (array === null) return false;
        return Boolean(array.find(a => a.original.term === item));
    }

    public static getSpecificResult(array: Array<any>, item: string): any
    {
        return array.find(a => a.original.term === item);
    }
};