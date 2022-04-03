const Colors = import.meta.glob('./*/colors.csv')
const Variants = import.meta.glob('./*/variants.csv')
const Art = import.meta.glob('/src/art/*/*-layer-*')


const VariantRow = ['border', 'back', 'ink'];

export interface Variant {
    back: string;
    border: string;
    ink: string;
};

const ColorRow = ['name', 'base', 'specular', 'emissive', 'background'];

export interface Color {
    name: string;
    base: string;
    specular: string;
    emissive: string;
    background: string;
};


const AllSeries = [
    "0-the-fool",
    "1-the-magician",
    "2-the-high-preistess",
    "3-the-empress",
    "4-the-emperor",
    "5-the-hierophant",
    "6-the-lovers",
    "7-the-chariot",
    "8-strength",
    "9-the-hermit",
    "10-wheel-of-forune",
    "11-justice",
    "12-the-hanged-man",
    "13-death",
    "14-temperance",
    "15-the-devil",
    "16-the-tower",
    "17-the-star",
    "18-the-moon",
    "19-the-sun",
    "20-judgement",
    "21-the-world",
];

export const seriesIdentifiers = Object.values(AllSeries) as SeriesIdentifier[];

export const defaultSeries = seriesIdentifiers[seriesIdentifiers.length - 1];

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
function loadCsv<U> (
    cols    : string[],
    csv     : CSV,
) : U[] {
    return csv.map(row => cols.reduce((agg, col, i) => ({ ...agg, [col] : row[i] }), {} as U)).slice(1, csv.length);
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
    colors = [...colors, ...(loadCsv<Color>(ColorRow, await loadColors(series)))];
    variants = [...variants, ...(loadCsv<Variant>(VariantRow, await loadVariants(series)))];

    // Retrieve color and variants from localstorage
    // TODO: this

    return {
        cardArt,
        colors,
        variants,
    }
};


// Download data for a legends series (for capturing localstorage changes).
export function saveData (series : SeriesIdentifier) : void {};
