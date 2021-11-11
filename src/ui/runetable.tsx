import Styles from './runetable.module.css';
import Rune from './rune';

interface ArcanaRune {
    number: number;
    arcana: string;
    rune: string;
};

export const runes: ArcanaRune[] = [
    {
        number: 0,
        arcana: 'The Fool',
        rune: 'ᚹ',
    },
    {
        number: 1,
        arcana: 'The Magician',
        rune: 'ᛓ',
    },
    {
        number: 2,
        arcana: 'The High Priestess',
        rune: 'ᚢ',
    },
    {
        number: 3,
        arcana: 'The Empress',
        rune: 'ᚦ',
    },
    {
        number: 4,
        arcana: 'The Emperor',
        rune: 'ᛓ',
    },
    {
        number: 5,
        arcana: 'The Hierophant',
        rune: 'ᚱ',
    },
    {
        number: 6,
        arcana: 'The Lovers',
        rune: 'ᛒ',
    },
    {
        number: 7,
        arcana: 'The Chariot',
        rune: 'ᚼ',
    },
    {
        number: 8,
        arcana: 'Strength',
        rune: 'ᛋ',
    },
    {
        number: 9,
        arcana: 'The Hermit',
        rune: 'ᛁ',
    },
    {
        number: 10,
        arcana: 'Wheel of Fortune',
        rune: 'ᛄ',
    },
    {
        number: 11,
        arcana: 'Justice',
        rune: 'ᚾ',
    },
    {
        number: 12,
        arcana: 'The Hanged Man',
        rune: 'ᛏ',
    },
    {
        number: 13,
        arcana: 'Death',
        rune: 'ᛠ',
    },
    {
        number: 14,
        arcana: 'Temperance',
        rune: 'ᛚ',
    },
    {
        number: 15,
        arcana: 'The Devil',
        rune: 'ᛉ',
    },
    {
        number: 16,
        arcana: 'The Tower',
        rune: 'ᛣ',
    },
    {
        number: 17,
        arcana: 'The Star',
        rune: 'ᛇ',
    },
    {
        number: 18,
        arcana: 'The Moon',
        rune: 'ᛟ',
    },
    {
        number: 19,
        arcana: 'The Sun',
        rune: 'ᚷ',
    },
    {
        number: 20,
        arcana: 'Judgement',
        rune: 'ᛈ',
    },
    {
        number: 21,
        arcana: 'The World',
        rune: 'ᛢ',
    }
];

export default function RuneTable() {
    return <div className={Styles.root}>
        {runes.map((r, i) => <div className={Styles.rune} key={`runetable${i}`}>
            {r.arcana}
            <Rune>{r.rune}</Rune>
            <span className="typescale-2" style={{width: '8em'}}>Nº {numberWord(r.number)}</span>
        </div>)}
    </div>
};

const ones = [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
];

const tens = [
    '',
    'twenty',
    // Tarot doesn't go further...
]

function numberWord (number: number) {
    if (number > 21) throw new Error('Not implemented.');
    if (number < 20) return ones[number];
    const ten = tens[Math.floor(number / 10) - 1];
    const one = number % 10;
    if (one > 0) return `${ten}-${ones[one]}`;
    return ten;
}