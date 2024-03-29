import { importArt } from 'src/store';
import * as THREE from 'three';
const Config = import.meta.glob('./*/config.json')
const Colors = import.meta.glob('./*/colors.csv')
const Variants = import.meta.glob('./*/variants.csv')
const Art = import.meta.glob('/src/art/*/*-layer-*')
import Stocks from './stocks.csv';


export const VariantRow = ['border', 'back', 'ink', 'mask', 'stock'];

export interface Variant {
    back: string;
    border: string;
    ink: string;
    mask?: string;
    stock: string;
};

export const ColorRow = ['name', 'base', 'specular', 'emissive', 'background'];

export interface Color {
    name: string;
    base: string;
    specular: string;
    emissive: string;
    background: string;
};

export const StockRow = ['name', 'base', 'specular', 'emissive', 'material'];;

export interface Stock {
    name: string;
    base: string;
    specular: string;
    emissive: string;
    material: string;
};

export interface Config {
    background: string;
};


const AllSeries = {
    "0-the-fool": undefined,
    "1-the-magician": undefined,
    "2-the-high-priestess": undefined,
    "3-the-empress": undefined,
    "4-the-emperor": undefined,
    "5-the-hierophant": undefined,
    "6-the-lovers": undefined,
    "7-the-chariot": undefined,
    "8-strength": undefined,
    "9-the-hermit": undefined,
    "10-wheel-of-fortune": undefined,
    "11-justice": undefined,
    "12-the-hanged-man": undefined,
    "13-death": undefined,
    "14-temperance": undefined,
    "15-the-devil": undefined,
    "16-the-tower": undefined,
    "17-the-star": undefined,
    "18-the-moon": undefined,
    "19-the-sun": undefined,
    "20-judgement": undefined,
    "21-the-world": undefined,
};

const backs = importArt(import.meta.glob('/src/art/common/back-*.webp'));
const borders = importArt(import.meta.glob('/src/art/common/border-*.webp'));

export const seriesIdentifiers = Object.keys(AllSeries) as SeriesIdentifier[];

export const defaultSeries = window.localStorage.getItem('series') as SeriesIdentifier || seriesIdentifiers[seriesIdentifiers.length - 1];

export type SeriesIdentifier = keyof typeof AllSeries;

export interface SeriesConf {
    variants: Variant[];
    colors: Color[];
    cardArt: Texture[];
    background: string;
};

export interface Texture {
    name: string;
    path: string;
};

type CSV = string[][];


// Converts csv rows into array of objects
export function loadCsv<U>(
    cols: string[],
    csv: CSV,
): U[] {
    return csv.map(row => cols.reduce((agg, col, i) => ({ ...agg, [col]: row[i] }), {} as U)).slice(1, csv.length);
};

// Converts array of objects into csv rows
export function dumpCsv<U>(
    cols: string[],
    data: U[],
): string {
    return [
        cols.join(','),
        ...data.map(row => cols.map(col => row[col]).join(','))
    ].join('\n');
};

// Create a manifest file
export function dumpManifest(
    variants : Variant[],
) {
    return [
        ...variants.map(v => `preview-animated-${generateFileName(v)}.webm,Animated Preview,preview animated back-${slug(v.back)} border-${slug(v.border)} ink-${slug(v.ink)} stock-${slug(v.stock)} ${v.mask ? slug(v.mask) : 'none'},An animated preview,video/webm`),
        ...variants.map(v => `preview-side-by-side-${generateFileName(v)}.webp,Side By Side Preview,preview side-by-side back-${slug(v.back)} border-${slug(v.border)} ink-${slug(v.ink)} stock-${slug(v.stock)} ${v.mask ? slug(v.mask) : 'none'},A side-by-side preview,image/webp`),
    ].join('\n');
};

// Retrieve variants
async function loadVariants(
    series: SeriesIdentifier,
) {
    return (await (Object.entries(Variants).find(([path], i) => path.includes(series)) as unknown as [string, () => Promise<{ default: CSV }>])[1]()).default;
};

// Retrieve colors
async function loadColors(
    series: SeriesIdentifier,
) {
    return (await (Object.entries(Colors).find(([path], i) => path.includes(series)) as unknown as [string, () => Promise<{ default: CSV }>])[1]()).default;
};

// Retrieve stocks
async function loadStocks() {
    return Stocks;
};

// Retrieve config
async function loadConfig(
    series: SeriesIdentifier,
): Promise<Config> {
    return (await (Object.entries(Config).find(([k]) => k.includes(series)) as unknown as [string, () => Promise<{ default: Config }>])[1]()).default;
}

// Retrieve card art layers
function loadArt(
    series: SeriesIdentifier,
): Texture[] {
    const art = Object.entries(Art)
        .filter(([path], i) => path.includes(series))
        .map(([path], i) => [path, (path.match(/\/([a-z0-9\-]+)\./) as string[])[1], i])
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => ({ path: x[0], name: x[1] })) as Texture[];
    return art
}

// Retrieve variants and colors data for one of the legends series.
export async function getData(
    series: SeriesIdentifier,
): Promise<SeriesConf> {

    const cardArt: Texture[] = loadArt(series);

    let colors: Color[] = [];
    let variants: Variant[] = [];
    let config: Config;

    // Retrieve color and variants from hardcoded data
    colors = loadCsv<Color>(ColorRow, await loadColors(series));
    variants = loadCsv<Variant>(VariantRow, await loadVariants(series));
    config = await loadConfig(series);

    // Retrieve color and variants from localstorage
    const localColors = window.localStorage.getItem(`colors-${series}`);
    if (localColors) colors = JSON.parse(localColors);
    const localVariants = window.localStorage.getItem(`variants-${series}`);
    if (localVariants) variants = JSON.parse(localVariants);
    const localConfig = window.localStorage.getItem(`config-${series}`);
    if (localConfig) config = JSON.parse(localConfig);

    return {
        cardArt,
        colors,
        variants,
        ...config,
    }
};

export const stocks = function () {
    let stocks = loadCsv<Stock>(StockRow, Stocks);
    const localConfig = window.localStorage.getItem(`stocks`);
    if (localConfig) stocks = JSON.parse(localConfig);
    return stocks;
}();

// Download data for a legends series (for capturing localstorage changes).
export function saveData(series: SeriesIdentifier): void { };

function randomBack () {

    const tiers = {
        "t1": {
            "pct": 90,
            "options": [
                'fate',
                'saxon',
                'saxon-bordered',
                'worn-saxon',
                'compass',
                'helmet',
                'knotwork-moon',
                'knotwork-ravens',
                'odal-rune',
                'raven-outline',
                'raven-solid',
                'swords',
                'wyrd',
                'oath-rings-inverted',
                'oath-rings',
                'cup-extra',
                'cup-wider',
                'cups',
            ],
        },
        "t2": {
            "pct": 10,
            "options": [
                'cinematic',
                'cup-inverted',
            ]
        },
    };

    if (Math.random() * 100 <= tiers.t2.pct) {
        return slug(tiers.t2.options[Math.floor(Math.random() * tiers.t2.options.length)]);
    } else {
        return slug(tiers.t1.options[Math.floor(Math.random() * tiers.t1.options.length)]);
    }
};

function randomBorder () {
    return slug(borders[Math.floor(Math.random() * borders.length)].name);
};

export function generate(
    supply: number,
    series: string,
): Variant[] {
    const stocks = {
        60: 'black',
        25: 'white',
        10: `${series}`,
        5: `${series}-gloss`,
    };
    const inks = {
        // T1
        "t1": {
            "pct": 45,
            "options": [
                "copper",
                "ferrous",
                "energetic",
                "sanguine",
                "lavender",
                "octarine",
                "santo",
            ],
        },
        // T2
        "t2": {
            "pct":  30,
            "options": [
                "silver",
                "ferrous-bright",
                "energetic-bright",
                "sanguine-bright",
                "lavender-bright",
                "octarine-bright",
                "santo-bright",
                "ward",
                "fools-gold",
                `${series}`,
            ],
        },
        // T3
        "t3": {
            "pct": 15,
            "options": [
                "gold",
                "ferrous-brilliant",
                "energetic-brilliant",
                "sanguine-brilliant",
                "lavender-brilliant",
                "octarine-brilliant",
                "santo-brilliant",
                "opal",
                "garnet",
                "crystal",
                `${series}-bright`,
            ],
        },
        // T4
        "t4": {
            "pct": 7,
            "options": [
                "dusk",
                "dawn",
                "witching-hour",
            ],
        },
        // T5
        "t5": {
            "pct": 3,
            "options": [
                "sultan",
                "sultana",
                "bubble-gum",
                "macbeth",
                `${series}-brilliant`,
                "cinematic",
            ]
        }
    };

    // const masks = {
    //     "t1": {
    //         "pct": 100,
    //         "options": [
    //             "line",
    //             "cinematic",
    //             "greek",
    //             "round",
    //             "birka",
    //             "haus",
    //         ]
    //     }
    // };

    function randomStock () {
        const k = Object.keys(stocks).sort();
        const m = k.reduce((x, y) => Number(y) > x ? Number(y) : x, 0)
        const t = k.reduce((x, y) => x + Number(y), 0);
        const r = (Math.random() * t);
        const stock = stocks[(k.find(x => x > r) || m)];
        return stock;
    };

    function randomInk () {
        const k = Object.entries(inks).map(([k, v]) => [k, v.pct]).sort();
        const m = k.reduce(([x, y], [k, v]) => v > y ? [k, v] : [x, y], ['', 0] as [string, number]);
        const t = k.reduce((x, [,y]) => x + y, 0);
        const r = (Math.random() * t);
        const tier = inks[k.find(([k, v]) => v < r)?.[0] || m[0]];
        return tier.options[Math.floor(Math.random() * tier.options.length)];
    };
    
    let variants: Variant[] = [];

    // Start with a few series colours
    variants.push({ stock: `${series}-gloss`, ink: `${series}-brilliant`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}-gloss`, ink: `${series}-bright`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}`, ink: `${series}-bright`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}`, ink: `${series}`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}`, ink: `${series}`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}`, ink: `${series}`, back: randomBack(), border: randomBorder(), mask: 'none' });
    variants.push({ stock: `${series}`, ink: `${series}`, back: randomBack(), border: randomBorder(), mask: 'none' });

    // Randomly generate the rest
    for (let i = supply - variants.length; i > 0; i--) {
        
        variants.push({
            ink: randomInk(),
            stock: randomStock(),
            back: randomBack(),
            border: randomBorder(),
            mask: 'none',
        });
    };
    
    return variants
};

console.log(dumpCsv(VariantRow, generate(110, 'hermit')));

export function generateFileName (
    variant : Variant,
) : string {
    return `${slug(variant.back)}-${slug(variant.border)}-${slug(variant.ink)}-${slug(variant.stock)}-${variant?.mask ? slug(variant.mask) : 'none'}`;
};

export function slug (
    string : string,
) : string {
    return string
        .toLowerCase()
        .replaceAll(' ', '-')
        .replaceAll('back-', '')
        .replaceAll('border-', '')
        .replaceAll('ink-', '')
        .replaceAll('mask-', '')
};