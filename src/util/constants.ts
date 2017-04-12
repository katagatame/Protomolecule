'use strict';

export type BotConstants = {
	// RegExp
	allowRegExp: RegExp,
	cslRegExp: RegExp,
	destroyRegExp: RegExp,
	disallowRegExp: RegExp,
	getRegExp: RegExp,
	scrubRegExp: RegExp,

	// avasarala, images and quotes supplied by /u/it-reaches-out
	avasaralaImages: Array<string>,
	avasaralaQuotes: Array<string>,

	// disekowtalowda dictionary
	beltaSpreadSheetID: string,
	characterList: Array<[string, string]>,
	partsOfSpeech: Array<string>,

	// guild
	guildID: string,
	guildIconURL: string
};

// tslint:disable-next-line:variable-name
const Constants: BotConstants = <any> {};

// RegExp
Constants.allowRegExp = new RegExp('\.allow\\s|\.a\\s', 'i');
Constants.cslRegExp = new RegExp('[^\,\\s][^\,]*[^\,\\s]*', 'ig');
Constants.destroyRegExp = new RegExp('\.dr\\s', 'i');
Constants.disallowRegExp = new RegExp('\.disallow\\s|\.d\\s', 'i');
Constants.getRegExp = new RegExp('\.gr\\s', 'i');
Constants.scrubRegExp = new RegExp('(?:-s)', 'ig');

// avasarala, images and quotes supplied by /u/it-reaches-out
Constants.avasaralaImages = [
	'http://i.imgur.com/gLAavTM.png',
	'http://i.imgur.com/BLW3xwc.png',
	'http://i.imgur.com/9naUBis.png',
	'http://i.imgur.com/XaNMSo1.png',
	'http://i.imgur.com/i8oaYj9.png',
	'http://i.imgur.com/gF4kme3.png',
	'http://i.imgur.com/FrZHD72.png',
	'http://i.imgur.com/l9B8QNj.png',
	'http://i.imgur.com/a3HUir3.png',
	'http://i.imgur.com/270wrQm.png'
];
Constants.avasaralaQuotes = [
	'Realizing you\'ve got shit on your fingers is the first step to washing your hands.',
	'No one likes a smart-ass.',
	'Always good to have a penis in uniform in the room.',
	'God save us all from good-looking men.',
	'As long as we keep comparing dicks, no one will shoot.',
	'You want a little ass-play, that\'s your business.',
	'Space is too fucking big.',
	'My life has become a single, ongoing revelation that I haven\'t been cynical enough.',
	'No one ever tries reconnecting with an ex-wife without seeming like an asshole.',
	'I know everything. This is a fucking test.',
	'Try not to put your dick in this. It\'s fucked enough already.',
	'When I said don\'t hurry, I didn\'t mean you should take the whole fucking day off.',
	'Stop busting my balls. I\'m out of tea.',
	'Meow meow cry meow meow. That\'s all I heard you say.',
	'I swear to God I\'ll have you turning tricks out of a prefab shed on the side of the highway.',
	'You do good work. Someday you might get a real job.',
	'Shut the fuck up now, dear, the grown-up is talking.',
	'Sleep? Yes, I remember that vaguely.',
	'Of course I want you to call me on my bullshit. That\'s what I pay you for.',
	'I don\'t give a fuck whose birthday it is, you make this happen before my meeting is over or I\'ll have your nuts as paperweights.',
	'This was a cock-up from the start.',
	'Just assume I know what I\'m doing, and that when I ask you to do the impossible, it\'s because even your failure helps our cause somehow.',
	'I have violated your privacy in ways you can\'t imagine.',
	'I do everything, and every second I talk to you costs ten thousand dollars.',
	'Would you all please shut the fuck up?',
	'I know why you kept me out of this, and I think you\'re a fucking moron for it, but put it aside. It doesn\'t matter now. Just do not pull that fucking trigger.',
	'This is just an excuse to wave their cocks at each other.',
	'He is walking around his words like they\'ve got poisoned spikes on them.',
	'I have crates of anti-herpes drugs that are more legitimately UN Navy than you are.',
	'I\'m sorry, did I seem to give a fuck that this is your ship? If I did, really, I was just being polite.',
	'We\'re off the clock now. You can stop blowing smoke up my ass.',
	'By the time he understands what we were really after, it\'ll be too late for him to do anything but hold his dick and cry.',
	'No one starts a war unless I say they can.',
	'I\'m not someone you want to fuck with.',
	'Call me that again and I\'ll have an officer beat you gently with a cattle prod.',
	'Most men who\'ve spent so much time with me seem convinced their cocks will fall off if they can\'t get away from me.',
	'Life is too short for this shit.',
	'So we\'re all fucking morons. Fine.',
	'This sucks donkey balls.',
	'Sounds like piss. I\'ll take it.',
	'You\'re an asshole and nobody loves you.',
	'Screw it, I need a drink.',
	'That man\'s asshole must be tight enough right now to bend space.',
	'He can\'t find his cock with both hands unless there\'s someone there to point him at it.',
	'He\'s a fucking busybody and he should stop putting his fingers in my shit.',
	'I don\'t mean that they all fuck men. I mean they\'re all men, the fuckers.',
	'How the fuck do you keep your hair like that? I look like a hedgehog\'s been humping my skull.'
];

// disekowtalowda dictionary
Constants.beltaSpreadSheetID = '1RCnWC3lQLmyo6P1IbLFB0n4x07d-oB5VqKxjv0R-EzY';
Constants.characterList = [
	['á', '160'],
	['é', '130'],
	['í', '161'],
	['ó', '162'],
	['ú', '163']
];
Constants.partsOfSpeech = [
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
	'Verb Phrase'
];

// guild
// Constants.guildID = '288472445822959618'; // expanse
Constants.guildID = '246683178134142979'; // development
Constants.guildIconURL = 'https://cdn.discordapp.com/icons/288472445822959618/2f192af7943f8401fec6b2a2455eb16a.jpg';

export default Constants;
