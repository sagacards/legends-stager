import React from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import create from 'zustand';

import Normal from 'art/common/normal.webp';
import FoolFlat from 'art/0-the-fool/fool-flat.webp';
import MagicianFlat from 'art/1-the-magician/magician-flat.webp';
import colors from 'three/primitives/colors';
const Backs = import.meta.glob('/src/art/common/back-*.webp');
const Borders = import.meta.glob('/src/art/common/border-*.webp');
const Fool = import.meta.glob('/src/art/0-the-fool/fool-layer-*.webp');
const Magician = import.meta.glob('/src/art/1-the-magician/magician-layer-*.webp');

export type ViewMode = 'side-by-side' | 'animated' | 'free';

export interface Color {
    name    : string;
    base    : string;
    specular: string;
    emissive: string;
    background: string;
};

export interface Texture {
    name: string;
    path: string;
};

interface Store {
    
    // Stager View Mode
    viewMode    : ViewMode;
    setViewMode : (m : ViewMode) => void;

    // Card Ink Colors
    colors      : Color[];
    setColors   : (c : Color[]) => void;

    // Active Color
    color       : Color;
    setColor    : (c : Color) => void;

    // Updating Colors
    saveNewColor: () => void;
    saveColor: () => void;

    // Card Backs
    backs       : Texture[];

    // Active Back
    back        : Texture;
    setBack     : (b : Texture) => void;

    // Card Borders
    borders     : Texture[];

    // Active Border
    border      : Texture;
    setBorder   : (b : Texture) => void;

};

const backs = importArt(Backs);
const borders = importArt(Borders);
const localColors = (window.localStorage.getItem('colors'))
    ? JSON.parse(window.localStorage.getItem('colors') as string) as Color[]
    : colors;

const useStore = create<Store>((set, get) => {
    return {
        viewMode: 'side-by-side',
        setViewMode (viewMode) {
            set({ viewMode });
        },

        colors: localColors,
        setColors (colors) {
            window.localStorage.setItem('colors', JSON.stringify(colors));
            set({ colors });
        },

        color: localColors[0],
        setColor (color) {
            // console.info(`Active color changed. Name: ${color.name}, Base: ${color.base}, Specular: ${color.specular}, Emissive: ${color.emissive}`);
            set({ color });
        },

        saveNewColor () {
            const setColors = get().setColors;

            const colors = get().colors;
            const color = get().color;

            if (!color) {
                console.error(`Cannot save new color, no color is defined.`);
                return;
            };

            const newColor = {
                ...color,
                name: colors.find(x => x.name === color.name)
                    ? `${color.name} (${colors.length})`
                    : color.name
            };

            setColors([ ...colors, newColor]);
        },

        saveColor () {
            const setColors = get().setColors;

            const colors = [...get().colors];
            const color = get().color;

            if (!color) {
                console.error(`Could not update color, no color is defined.`);
                return
            };

            const existing = colors.find(x => x.name === color.name);

            if (!existing) {
                console.error(`Could not save existing colour. It doesn't exist!`)
                return;
            }

            existing.base = color.base;
            existing.specular = color.specular;
            existing.emissive = color.emissive;

            setColors(colors);
        },

        backs,
        back: backs[0],
        setBack (back) {
            set({ back });
        },

        borders,
        border: borders[0],
        setBorder (border) {
            set({ border });
        },
    }
});

export default useStore;

export function importArt (modules : Record<string, () => Promise<{ [key: string]: any; }>>) : Texture[] {
    return Object.entries(modules)
        .map(([path], i) => [path, (path.match(/\/([a-z0-9\-]+)\./) as string[])[1], i])
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => ({ path: x[0], name: x[1]})) as Texture[];
}