import * as THREE from 'three';
const Colors = import.meta.glob('./*/colors.csv')
const Variants = import.meta.glob('./*/variants.csv')
const Art = import.meta.glob('/src/art/*/*-layer-*')


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


const AllSeries = {
    "0-the-fool"            : undefined,
    "1-the-magician"        : undefined,
    "2-the-high-priestess"  : undefined,
    "3-the-empress"         : undefined,
    "4-the-emperor"         : undefined,
    "5-the-hierophant"      : undefined,
    "6-the-lovers"          : undefined,
    "7-the-chariot"         : undefined,
    "8-strength"            : undefined,
    "9-the-hermit"          : undefined,
    "10-wheel-of-fortune"    : undefined,
    "11-justice"            : undefined,
    "12-the-hanged-man"     : undefined,
    "13-death"              : undefined,
    "14-temperance"         : undefined,
    "15-the-devil"          : undefined,
    "16-the-tower"          : undefined,
    "17-the-star"           : undefined,
    "18-the-moon"           : undefined,
    "19-the-sun"            : undefined,
    "20-judgement"          : undefined,
    "21-the-world"          : undefined,
};

export const seriesIdentifiers = Object.keys(AllSeries) as SeriesIdentifier[];

export const defaultSeries = window.localStorage.getItem('series') as SeriesIdentifier || seriesIdentifiers[seriesIdentifiers.length - 1];

export type SeriesIdentifier = keyof typeof AllSeries;

export interface SeriesConf {
    variants: Variant[];
    colors  : Color[];
    cardArt : Texture[];
};

export interface Texture {
    name: string;
    path: string;
};

type CSV = string[][];


// Converts csv rows into array of objects
export function loadCsv<U> (
    cols    : string[],
    csv     : CSV,
) : U[] {
    return csv.map(row => cols.reduce((agg, col, i) => ({ ...agg, [col] : row[i] }), {} as U)).slice(1, csv.length);
};

// Converts array of objects into csv rows
export function dumpCsv<U> (
    cols    : string[],
    data    : U[],
) : string {
    return [
        cols.join(','),
        ...data.map(row => cols.map(col => row[col]).join(','))
    ].join('\n');
};

// Retrieve variants
async function loadVariants (
    series : SeriesIdentifier,
) {
    return (await (Object.entries(Variants).find(([path], i) => path.includes(series)) as unknown as [string, () => Promise<{ default : CSV}>])[1]()).default;
};

// Retrieve colors
async function loadColors (
    series : SeriesIdentifier,
) {
    return (await (Object.entries(Colors).find(([path], i) => path.includes(series)) as unknown as [string, () => Promise<{ default : CSV}>])[1]()).default;
};

// Retrieve card art layers
function loadArt (
    series : SeriesIdentifier,
) : Texture[] {
    const art = Object.entries(Art)
        .filter(([path], i) => path.includes(series))
        .map(([path], i) => [path, (path.match(/\/([a-z0-9\-]+)\./) as string[])[1], i])
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => ({ path: x[0], name: x[1]})) as Texture[];
    return art
}

// Retrieve variants and colors data for one of the legends series.
export async function getData (
    series : SeriesIdentifier,
) : Promise<SeriesConf> {

    const cardArt : Texture[] = loadArt(series);

    let colors      : Color[]   = [];
    let variants    : Variant[] = [];

    // Retrieve color and variants from hardcoded data
    colors = loadCsv<Color>(ColorRow, await loadColors(series));
    variants = loadCsv<Variant>(VariantRow, await loadVariants(series));

    // Retrieve color and variants from localstorage
    const localColors = window.localStorage.getItem(`colors-${series}`);
    if (localColors) colors = JSON.parse(localColors);
    const localVariants = window.localStorage.getItem(`variants-${series}`);
    if (localVariants) variants = JSON.parse(localVariants);

    return {
        cardArt,
        colors,
        variants,
    }
};

export const stocks : Color[] = [
    {
        name: 'black',
        base: '#111111',
        specular: '#111111',
        emissive: '#111111',
        background: '#000000'
    },
    {
        name: 'white',
        base: '#ffffff',
        specular: '#ffffff',
        emissive: '#ffffff',
        background: '#000000'
    },
    {
        name: 'red',
        base: '#3B0303',
        specular: '#3B0303',
        emissive: '#3B0303',
        background: '#000000'
    },
    {
        name: 'blue',
        base: '#2E2F59',
        specular: '#2E2F59',
        emissive: '#2E2F59',
        background: '#000000'
    },
];


// Download data for a legends series (for capturing localstorage changes).
export function saveData (series : SeriesIdentifier) : void {};
