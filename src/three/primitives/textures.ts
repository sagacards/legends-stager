import { useLoader } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

// import useLegendManifest, { host } from 'hooks/legend-manifest';

import Normal from 'art/common/normal.webp';
import FoolFlat from 'art/0-the-fool/fool-flat.webp';
import MagicianFlat from 'art/1-the-magician/magician-flat.webp';
import CinematicCover from 'art/1-the-magician/cinematic-cover.webp';
import { Texture } from 'data/index';
const Backs = import.meta.glob('/src/art/common/back-*.webp');
const Borders = import.meta.glob('/src/art/common/border-*.webp');
const Fool = import.meta.glob('/src/art/0-the-fool/fool-layer-*.webp');
const Magician = import.meta.glob('/src/art/1-the-magician/magician-layer-*.webp');

export function useGoldLeafNormal(): THREE.Texture {
    const texture = useLoader(THREE.TextureLoader, Normal);
    return texture;
};

export function useCardBacks() {
    return useArt(Backs);
};

export function useCardBorders() {
    const art = useArt(Borders);
    return art
};

export function useArt (modules : Record<string, () => Promise<{ [key: string]: any; }>>) : Texture[] {
    return Object.entries(modules)
        .map(([path], i) => [path, (path.match(/\/([a-z0-9\-]+)\./) as string[])[1], i])
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => ({ path: x[0], name: x[1]})) as Texture[];
}

export function useCinematicCover() {
    return useLoader(THREE.TextureLoader, CinematicCover);
};