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
    downloadColors: () => void;

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

    // Exporting
    capture?    : [THREE.Camera, THREE.Scene, THREE.WebGLRenderer];
    setCapture  : (capture : [THREE.Camera, THREE.Scene, THREE.WebGLRenderer]) => void;
    exportAllSideBySide: () => void;
    saveImage   : (name: string) => void;
    randomPlaying?: number;
    randomPlay  : () => void;

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

            existing.name = color.name;
            existing.base = color.base;
            existing.specular = color.specular;
            existing.emissive = color.emissive;
            existing.background = color.background;

            setColors(colors);
        },

        async downloadColors () {
            const colors = get().colors;
            const json = JSON.stringify(colors);
            var a = document.createElement('a');
            a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(json));
            a.setAttribute('download', 'colors.json');
            await a.click();

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

        setCapture (capture) { set({ capture })},

        async exportAllSideBySide () {
            const backs = get().backs;
            const borders = get().borders;
            const colors = get().colors;
            const capture = get().capture;

            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }

            // Run through each texture once to make sure they're all loaded.
            for (const back of backs) { await delay(100); set({ back }) };
            for (const border of borders) { await delay(100); set({ border }) };

            for (const back of backs) {
                set({ back });
                for (const border of borders) {
                    set({ border });
                    for (const color of colors) {
                        set({ color });
                        const name = `preview-side-by-side-${back.name.toLowerCase()}-${border.name.toLowerCase()}-${color.name.toLowerCase()}.png`;
                        if (false) {
                            // variants.includes(name);
                            continue;
                        }
                        console.info(`render ${name}`);
                        await get().saveImage(name);
                    };
                };
            };
        },

        async saveImage(name: string) {
            await delay(500);
            const capture = get().capture;
            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }
            const [camera, scene, gl] = capture;
            gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
            gl.render(scene, camera);
            await gl.domElement.toBlob(
                async function (blob) {
                    if (!blob) return;
                    var a = document.createElement('a');
                    var url = await URL.createObjectURL(blob);
                    a.href = url;
                    a.download = name;
                    await a.click();
                },
                'image/png',
                1.0
            )
            gl.domElement.getContext('webgl', { preserveDrawingBuffer: false });
        },

        randomPlay () {
            let i = get().randomPlaying;
            if (i) {
                clearInterval(i);
                set({ randomPlaying: undefined });
                return
            };
            const backs = get().backs;
            const borders = get().borders;
            const colors = get().colors;
            i = setInterval(() => {
                const back = backs[Math.floor(backs.length * Math.random())];
                const border = borders[Math.floor(borders.length * Math.random())];
                const color = colors[Math.floor(colors.length * Math.random())];
                set({ back, border, color });
            }, 250);
            set({ randomPlaying : i });
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

async function delay (t = 500) {
    return new Promise<any>((resolve) => {
        setTimeout(() => resolve(true), t);
    });
}