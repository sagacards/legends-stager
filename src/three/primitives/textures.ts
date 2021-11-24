import { useLoader } from '@react-three/fiber';
import React from 'react';
import * as THREE from 'three';

import CardBack1 from 'assets/textures/backs/1k/fate.webp';
import CardBack2 from 'assets/textures/backs/1k/saxon-bordered.webp';
import CardBack3 from 'assets/textures/backs/1k/saxon-shaded.webp';
import CardBack4 from 'assets/textures/backs/1k/saxon.webp';

import CardBorder1 from 'assets/textures/borders/1k/line.webp';
import CardBorder2 from 'assets/textures/borders/1k/naked.webp';
import CardBorder3 from 'assets/textures/borders/1k/round.webp';
import CardBorder4 from 'assets/textures/borders/1k/staggered.webp';
import CardBorder5 from 'assets/textures/borders/1k/thicc.webp';
import CardBorder6 from 'assets/textures/borders/1k/greek.webp';
import CardBorder7 from 'assets/textures/borders/1k/saxon-shaded.webp';
import CardBorder8 from 'assets/textures/borders/1k/saxon.webp';

import FoolLayerA from 'assets/textures/cards/1k/0-the-fool/a.webp';
import FoolLayerB from 'assets/textures/cards/1k/0-the-fool/b.webp';
import FoolLayerC from 'assets/textures/cards/1k/0-the-fool/c.webp';
import FoolLayerD from 'assets/textures/cards/1k/0-the-fool/d.webp';
import FoolLayerE from 'assets/textures/cards/1k/0-the-fool/e.webp';
import FoolFlat from 'assets/textures/cards/complete-cropped.webp';
import FoolBG from 'assets/textures/cards/1k/0-the-fool/bg.webp';

import MagicianLayerA from 'assets/textures/cards/1k/1-the-magician/a.webp';
import MagicianLayerB from 'assets/textures/cards/1k/1-the-magician/b.webp';
import MagicianLayerC from 'assets/textures/cards/1k/1-the-magician/c.webp';
import MagicianLayerD from 'assets/textures/cards/1k/1-the-magician/d.webp';
import MagicianLayerE from 'assets/textures/cards/1k/1-the-magician/e.webp';

import Normal from 'assets/textures/normals/1k/noise.webp';
import useLegendManifest, { host } from 'hooks/legend-manifest';




export function useLegendNormal() : THREE.Texture {
    const { maps : { normal } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${normal}`);
    return texture;
};

export function useLegendBack() : THREE.Texture {
    const { maps : { back } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${back}`);
    return texture;
};

export function useLegendBorder() : THREE.Texture {
    const { maps : { border } } = useLegendManifest();
    const texture = useLoader(THREE.TextureLoader, `${host}${border}`);
    return texture;
};

export function useLegendColors() : [THREE.Color, THREE.Color, THREE.Color] {
    const { colors : { base, specular, emissive } } = useLegendManifest();
    return [
        new THREE.Color(base).convertSRGBToLinear(),
        new THREE.Color(specular).convertSRGBToLinear(),
        new THREE.Color(emissive).convertSRGBToLinear(),
    ];
}

export function useGoldLeafNormal() : THREE.Texture {
    const texture = useLoader(THREE.TextureLoader, Normal);
    return texture;
};

export function useTheFoolLayers(conf : 'all' | 'flat' | '2' = 'all') : [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture] {
    const layers = React.useMemo(() => {
        return conf === 'all' ? [
            [useLoader(THREE.TextureLoader, FoolLayerA), 0],
            [useLoader(THREE.TextureLoader, FoolLayerB), 1],
            [useLoader(THREE.TextureLoader, FoolLayerC), 2],
            [useLoader(THREE.TextureLoader, FoolLayerD), 3],
            [useLoader(THREE.TextureLoader, FoolLayerE), 4],
        ] : conf === '2' ? [
            [useLoader(THREE.TextureLoader, FoolLayerA), 0],
            [useLoader(THREE.TextureLoader, FoolBG), 0],
        ] : [
            [useLoader(THREE.TextureLoader, FoolFlat), 0],
        ]
    }, []);
    return layers
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => x[0]) as [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture];
};

export function useTheMagicianLayers() : [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture] {
    const layers = React.useMemo(() => [
        [useLoader(THREE.TextureLoader, MagicianLayerA), 0],
        [useLoader(THREE.TextureLoader, MagicianLayerB), 1],
        [useLoader(THREE.TextureLoader, MagicianLayerC), 2],
        [useLoader(THREE.TextureLoader, MagicianLayerD), 3],
        [useLoader(THREE.TextureLoader, MagicianLayerE), 4],
    ], []);
    return layers
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => x[0]) as [THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture, THREE.Texture];
};

export function useCardBacks() {
    const backs = React.useMemo(() => [
        [useLoader(THREE.TextureLoader, CardBack1), 0],
        [useLoader(THREE.TextureLoader, CardBack2), 1],
        [useLoader(THREE.TextureLoader, CardBack3), 2],
        [useLoader(THREE.TextureLoader, CardBack4), 3],
    ], []);
    return backs
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => x[0]) as [THREE.Texture, THREE.Texture, THREE.Texture];
}

export function useCardBorders() {
    const borders = React.useMemo(() => [
        [useLoader(THREE.TextureLoader, CardBorder1), 0],
        [useLoader(THREE.TextureLoader, CardBorder2), 1],
        [useLoader(THREE.TextureLoader, CardBorder3), 2],
        [useLoader(THREE.TextureLoader, CardBorder4), 3],
        [useLoader(THREE.TextureLoader, CardBorder5), 4],
        [useLoader(THREE.TextureLoader, CardBorder6), 5],
        [useLoader(THREE.TextureLoader, CardBorder7), 6],
        [useLoader(THREE.TextureLoader, CardBorder8), 7],
    ], []);
    return borders
        .sort((a, b) => (a[1] as number) - (b[1] as number))
        .map(x => x[0]) as [THREE.Texture, THREE.Texture, THREE.Texture];
}