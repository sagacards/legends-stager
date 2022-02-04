import React from 'react';
import * as THREE from 'three';
import create from 'zustand';
import { useCardBacks, useCardBorders } from 'three/primitives/textures';
import colors from 'three/primitives/colors';

export type ViewMode = 'side-by-side' | 'animated' | 'free';

export interface Color {
    name    : string;
    base    : string;
    specular: string;
    emissive: string;
};

export interface Texture {
    name    : string;
    texture : THREE.Texture;
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
    setBacks    : (b : Texture[]) => void;

    // Active Back
    back        : Texture;
    setBack     : (b : Texture) => void;

    // Card Borders
    borders     : Texture[];
    setBorders  : (b : Texture[]) => void;

    // Active Border
    border      : Texture;
    setBorder   : (b : Texture) => void;

};

export default function useStore() {

    const backs = useCardBacks();
    const borders = useCardBorders();

    const initialColors = React.useMemo(() => {
        if (window.localStorage.getItem('colors')) {
            const localColors = JSON.parse(window.localStorage.getItem('colors') as string) as Color[];
            return localColors;
        }
        return colors;
    }, [])

    const useStore = create<Store>((set, get) => ({
        viewMode: 'side-by-side',
        setViewMode (viewMode) {
            set({ viewMode });
        },

        colors: initialColors,
        setColors (colors) {
            window.localStorage.setItem('colors', JSON.stringify(colors));
            set({ colors });
        },

        color: initialColors[0],
        setColor (color) {
            // Use a clone so we can edit properties without touching the original
            const c = { ...color };
            set({ color: c });
        },

        saveNewColor () {
            const setColors = get().setColors;

            const colors = get().colors;
            const color = get().color;

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

        backs: backs,
        setBacks (backs) {
            set({ backs });
        },

        back: backs[0],
        setBack (back) {
            set({ back });
        },

        borders: borders,
        setBorders (borders) {
            set({ borders });
        },

        border: borders[0],
        setBorder (border) {
            set({ border });
        },
    }));

    return useStore;
};