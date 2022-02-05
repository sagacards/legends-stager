import { useLoader } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

import useLegendManifest, { host } from 'hooks/legend-manifest';

import Normal from 'art/common/normal.webp';
import FoolFlat from 'art/0-the-fool/fool-flat.webp';
import MagicianFlat from 'art/1-the-magician/magician-flat.webp';
import { Texture } from 'src/store';
const Backs = import.meta.glob('/src/art/common/back-*.webp');
const Borders = import.meta.glob('/src/art/common/border-*.webp');
const Fool = import.meta.glob('/src/art/0-the-fool/fool-layer-*.webp');
const Magician = import.meta.glob('/src/art/1-the-magician/magician-layer-*.webp');

export function useLegendNormal(): THREE.Texture {
    const { maps: { normal } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${normal}`);
    return texture;
};

export function useLegendBack(): THREE.Texture {
    const { maps: { back } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${back}`);
    return texture;
};

export function useLegendBorder(): THREE.Texture {
    const { maps: { border } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${border}`);
    return texture;
};

export function useLegendColors(): [THREE.Color, THREE.Color, THREE.Color] {
    const { colors: { base, specular, emissive } } = useLegendManifest();
    return [
        new THREE.Color(base).convertSRGBToLinear(),
        new THREE.Color(specular).convertSRGBToLinear(),
        new THREE.Color(emissive).convertSRGBToLinear(),
    ];
};

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

export function useTheFoolLayers() {
    return useArt(Fool);
}

export function useTheFoolFlat() {
    return useLoader(THREE.TextureLoader, FoolFlat);
}

export function useTheMagicianLayers() {
    return useArt(Magician);
}

export function useTheMagicianFlat() {
    return useLoader(THREE.TextureLoader, MagicianFlat);
}

export function useArt (modules : Record<string, () => Promise<{ [key: string]: any; }>>) : Texture[] {
    return React.useMemo(() => Object.entries(modules)
        .map(([path], i) => [path, (path.match(/\/([a-z0-9\-]+)\./) as string[])[1], i])
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => ({ path: x[0], name: x[1]})) as Texture[]
    , []);
}