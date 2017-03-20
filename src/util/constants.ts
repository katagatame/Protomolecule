'use strict';

export type BotConstants = {
    beltaSpreadSheetID: string,
    partsOfSpeech: Array<string>,
    charcaterList: Array<[string, string]>
}

const Constants: BotConstants = <any> {};

Constants.beltaSpreadSheetID = '1RCnWC3lQLmyo6P1IbLFB0n4x07d-oB5VqKxjv0R-EzY';
Constants.partsOfSpeech = ['Adjective','Adverb','Article','Auxiliary Verb','Bound Morpheme','Conjunction','Determiner','Interjection','Noun','Noun Phrase','Number','Particle','Phrase','Prefix','Preposition','Pronoun','Proper Noun','Quantifier','Suffix','Tag Question','Verb','Verb Phrase',];
Constants.charcaterList = [['á', '160'], ['é', '130'], ['í', '161'], ['ó', '162'], ['ú', '163']];

export default Constants;
