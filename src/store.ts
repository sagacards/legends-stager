import React from 'react';
import * as THREE from 'three';
import create from 'zustand';
//@ts-ignore
import WebMWriter from 'webm-writer';
//@ts-ignore
import download from 'downloadjs';
import { Variant, Color, getData, SeriesIdentifier, defaultSeries } from 'data/index'
const Backs = import.meta.glob('/src/art/common/back-*.webp');
const Borders = import.meta.glob('/src/art/common/border-*.webp');

const defaultSeriesData = getData(defaultSeries);
console.log(defaultSeriesData)

export type ViewMode = 'side-by-side' | 'animated' | 'free';

export interface Texture {
    name: string;
    path: string;
};

interface CaptureContext {
    camera  : THREE.Camera;
    scene   : THREE.Scene;
    gl      : THREE.WebGLRenderer;
 };

interface Store {
    
    // Stager View Mode
    viewMode    : ViewMode;
    setViewMode : (m : ViewMode) => void;

    // Series
    series      : SeriesIdentifier;
    setSeries   : (s : SeriesIdentifier) => void;

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
    exporting       : boolean;
    capture?        : CaptureContext;
    setCapture      : (capture : CaptureContext) => void;
    saveStatic      : () => void;
    saveAllStatic   : () => void;
    rotation?       : [number, number, number];
    saveAnimated    : () => void;
    saveAllAnimated : () => void;
    randomPlaying?  : number;
    randomPlay      : () => void;
    exportSampler   : () => void;

    // Active Variant
    variant         : Variant;
    setVariant      : (variant : Variant) => void;

    // Variants
    variants        : Variant[];
    setVariants     : (v : Variant[]) => void;
    addVariant      : () => void;
    downloadVariants: () => void;


};

const backs = importArt(Backs);
const borders = importArt(Borders);

console.log(backs[0])

let resolver : () => void = () => {};
const frames = 60 * 1 // 12;
let i = -60;

const useStore = create<Store>((set, get) => {
    return {
        viewMode: 'side-by-side',
        setViewMode (viewMode) {
            set({ viewMode });
            if (viewMode === 'free' || viewMode === 'animated') {
                set({ rotation: [0, 0, 0] });
            }
        },

        series: defaultSeries,
        setSeries (series) {
            set({ series });
        },

        variants : defaultSeriesData.variants,
        setVariants (variants) {
            set({ variants });
        },
        addVariant () {
            const variants = [...get().variants, { back: get().back.name, border: get().border.name, ink: get().color.name }];
            window.localStorage.setItem('variants', JSON.stringify(variants));
            set({ variants });
        },

        variant : defaultSeriesData.variants[0],
        setVariant (variant) {
            const { colors, backs, borders } = get();
            const color = colors.find(x => x.name.toLowerCase() === variant.ink.toLowerCase()) as Color;
            const back = backs.find(x => x.name.toLowerCase() === `back-${variant.back.toLowerCase()}`) as Texture;
            const border = borders.find(x => x.name.toLowerCase() === `border-${variant.border.toLowerCase()}`) as Texture;
            set({ variant, color, back, border });
        },

        async downloadVariants () {
            const variants = get().variants;
            const json = JSON.stringify(variants);
            var a = document.createElement('a');
            a.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(json));
            a.setAttribute('download', 'variants.json');
            await a.click();
        },

        colors: defaultSeriesData.colors,
        setColors (colors) {
            window.localStorage.setItem('colors', JSON.stringify(colors));
            set({ colors });
        },

        color: defaultSeriesData.colors[0],
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

        exporting : false,

        setCapture (capture) { set({ capture })},

        async saveStatic() {
            await delay(500);
            const viewmode = get().viewMode;
            get().setViewMode('side-by-side');
            const capture = get().capture;
            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }
            capture.gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
            capture.gl.render(capture.scene, capture.camera);
            await capture.gl.domElement.toBlob(
                async function (blob) {
                    if (!blob) return;
                    var a = document.createElement('a');
                    var url = await URL.createObjectURL(blob);
                    const name = `preview-side-by-side-${get().back.name.toLowerCase().replaceAll('back-', '')}-${get().border.name.toLowerCase().replaceAll('border-', '')}-${get().color.name.toLowerCase().replaceAll(' ', '-')}.png`;
                    a.href = url;
                    a.download = name;
                    await a.click();
                    get().setViewMode(viewmode);
                },
                'image/png',
                1.0
            )
            capture.gl.domElement.getContext('webgl', { preserveDrawingBuffer: false });
            await delay(500);
        },

        async saveAllStatic () {
            const variants = get().variants;
            const setVariant = get().setVariant;
            const capture = get().capture;

            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }

            // Run through each texture once to make sure they're all loaded.
            for (const back of backs) { await delay(100); set({ back }) };
            for (const border of borders) { await delay(100); set({ border }) };

            for (const variant of variants) {
                setVariant(variant);
                const name = `preview-side-by-side-${get().back.name.toLowerCase().replaceAll('back-', '')}-${get().border.name.toLowerCase().replaceAll('border-', '')}-${get().color.name.toLowerCase().replaceAll(' ', '-')}.png`;
                console.info(`render ${name}`);
                await get().saveStatic();
            };
        },

        async randomPlay () {
            // Run through each texture once to make sure they're all loaded.
            for (const back of backs) { await delay(100); set({ back }) };
            for (const border of borders) { await delay(100); set({ border }) };

            let i = get().randomPlaying;
            if (i) {
                clearInterval(i);
                set({ randomPlaying: undefined });
                return
            };
            const variants = get().variants;
            i = setInterval(() => {
                const variant = variants[Math.floor(variants.length * Math.random())];
                get().setVariant(variant);
            }, 1000);
            set({ randomPlaying : i });
        },

        async exportSampler () {
            // Run through each texture once to make sure they're all loaded.
            for (const back of backs) { await delay(100); set({ back }) };
            for (const border of borders) { await delay(100); set({ border }) };

            const frames = 60 * 12;
            const variants = get().variants;

            const variant = variants[Math.floor(variants.length * Math.random())];
            get().setVariant(variant);

            const capture = get().capture;
            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }
            
            const start = new Date();
            console.log(`${start.toLocaleTimeString()} Rendering ${frames} frames...`);
            
            const capturer = new WebMWriter({
                quality: 1,
                frameRate: 30,
            });

            i = -60 * 8;

            set({ exporting: true, viewMode: 'animated' });
            
            function render () {
                if (!capture) {
                    console.error(`Can't capture, no rendering context.`);
                    return;
                };
                if (i > 0 && i % 90 === 0) {
                    const variant = variants[Math.floor(variants.length * Math.random())];
                    get().setVariant(variant);
                };
                set({ rotation: [0, -((i / (frames / 4)) * Math.PI * 2) % (Math.PI * 2) + Math.PI, 0] });
                capture.gl.render(capture.scene, capture.camera);
                i++;
                if (i >= 0) capturer.addFrame(capture.gl.domElement);
                if (i < frames * 2) {
                    requestAnimationFrame(render);
                } else {
                    const name = `preview-animated-${get().back.name.toLowerCase().replaceAll('back-', '')}-${get().border.name.toLowerCase().replaceAll('border-', '')}-${get().color.name.toLowerCase().replaceAll(' ', '_')}.webm`;
                    capturer.complete()
                    .then(function(blob : any) {
                        download(blob, name, 'video/webm');
                    });
                    console.log(`Done. Took ${(new Date().getTime() - start.getTime()) / 1000} seconds.`)
                    set({ rotation : undefined, exporting: false, });
                    if (resolver) resolver();
                }
            }

            render();

            return new Promise<void>(resolve => resolver = resolve);
        },

        async saveAnimated () {
            const capture = get().capture;
            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }

            const frameRate = 24;
            const duration = 4;

            const frames = frameRate * duration;
            
            const start = new Date();
            console.log(`${start.toLocaleTimeString()} Rendering ${frames} frames...`);
            
            const capturer = new WebMWriter({
                quality: 0.75,
                frameRate,
            });

            i = -60;

            set({ exporting: true, viewMode: 'animated' });
            
            function render () {
                if (!capture) {
                    console.error(`Can't capture, no rendering context.`);
                    return;
                }
                set({ rotation: [0, -((i / frames) * Math.PI * 2) % (Math.PI * 2) + Math.PI, 0] });
                capture.gl.render(capture.scene, capture.camera);
                i++;
                if (i >= 0) capturer.addFrame(capture.gl.domElement);
                if (i < frames) {
                    requestAnimationFrame(render);
                } else {
                    const name = `preview-animated-${get().back.name.toLowerCase().replaceAll('back-', '')}-${get().border.name.toLowerCase().replaceAll('border-', '')}-${get().color.name.toLowerCase().replaceAll(' ', '-')}.webm`;
                    capturer.complete()
                    .then(function(blob : any) {
                        download(blob, name, 'video/webm');
                    });
                    console.log(`Done. Took ${(new Date().getTime() - start.getTime()) / 1000} seconds.`)
                    set({ rotation : undefined, exporting: false, });
                    if (resolver) resolver();
                }
            }

            render();

            return new Promise<void>(resolve => resolver = resolve);
        },

        async saveAllAnimated () {
            const capture = get().capture;
            const variants = get().variants;
            const setVariant = get().setVariant;

            if (!capture) {
                console.error(`Can't capture, no rendering context.`);
                return;
            }

            // Run through each texture once to make sure they're all loaded.
            for (const back of backs) { await delay(100); set({ back }) };
            for (const border of borders) { await delay(100); set({ border }) };

            for (const variant of variants) {
                setVariant(variant);
                const name = `preview-animated-${get().back.name.toLowerCase().replaceAll('back-', '')}-${get().border.name.toLowerCase().replaceAll('border-', '')}-${get().color.name.toLowerCase().replaceAll(' ', '-')}.png`;
                console.info(`render ${name}`);
                await get().saveAnimated()
            };
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