// TODO: Import like this instead
// const Backs = import.meta.glob('/src/art/common/back-*.webp');
// const Borders = import.meta.glob('/src/art/common/border-*.webp');
import { useTheFoolLayers, useTheMagicianLayers } from 'three/primitives/textures';
import FoolColors from './0-the-fool/colors.csv'
import FoolVariants from './0-the-fool/variants.csv'
import MagicianColors from './1-the-magician/colors.csv'
import MagicianVariants from './1-the-magician/variants.csv'


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


const AllSeries = {
    "0-the-fool": {
        colors      : FoolColors,
        variants    : FoolVariants,
        layers      : useTheFoolLayers(),
    },
    "1-the-magician": {
        colors      : MagicianColors,
        variants    : MagicianVariants,
        layers      : useTheMagicianLayers(),
    }
};

export const seriesIdentifiers = Object.keys(AllSeries) as SeriesIdentifier[];

export const defaultSeries = seriesIdentifiers[seriesIdentifiers.length - 1];

export type SeriesIdentifier = keyof typeof AllSeries;

export interface SeriesConf {
    variants: Variant[];
    colors  : Color[];
};


// Converts csv rows into array of objects
function loadCsv<U> (
    cols    : string[],
    csv     : string[][],
) : U[] {
    return csv.map(row => cols.reduce((agg, col, i) => ({ ...agg, [col] : row[i] }), {} as U)).slice(1, csv.length);
};

// Retrieve variants and colors data for one of the legends series.
export function getData (
    series : SeriesIdentifier,
) : SeriesConf {

    let colors      : Color[]   = [];
    let variants    : Variant[] = [];

    const { colors : fixedColors, variants : fixedVariants } = AllSeries[series];

    // Retrieve color and variants from hardcoded data
    colors = [...colors, ...(loadCsv<Color>(ColorRow, fixedColors))];
    variants = [...variants, ...(loadCsv<Variant>(VariantRow, fixedVariants))];

    // Retrieve color and variants from localstorage
    // TODO: this

    return {
        colors,
        variants,
    }
};


// Download data for a legends series (for capturing localstorage changes).
export function saveData (series : SeriesIdentifier) : void {};
