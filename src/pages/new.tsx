import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { button, buttonGroup, useControls } from 'leva';
import { ButtonGroupInput, Schema } from 'leva/dist/declarations/src/types';
import React from 'react';
import useStore, { Color, Texture, ViewMode } from 'src/store';
import * as THREE from 'three';
import colors from 'three/primitives/colors';
import shallow from 'zustand/shallow'

let colorBase = new THREE.Color(colors[0].base).convertSRGBToLinear();
let colorSpecular = new THREE.Color(colors[0].specular).convertSRGBToLinear();
let colorEmissive = new THREE.Color(colors[0].emissive).convertSRGBToLinear();

function StagingScene () {

    const { scene } = useThree();

    React.useEffect(() => {
        scene.background = new THREE.Color('#000');
    }, []);

    useStageControls();

    useFrame(state => {});

    return <></>
};


////////////////////////
// Scene Controls UI //
//////////////////////


function useStageControls () {

    const { backs, borders, colors, color, back, border, setViewMode, setBack, setBorder, setColor, saveNewColor, } = useStore()(state => ({
        backs       : state.backs,
        borders     : state.borders,
        colors      : state.colors,
        color       : state.color,
        back        : state.back,
        border      : state.border,
        setViewMode : state.setViewMode,
        setBack     : state.setBack,
        setBorder   : state.setBorder,
        setColor    : state.setColor,
        saveNewColor: state.saveNewColor,
    }));
    const unsub = useStore().subscribe(
        state => {
            console.log(state)
        }
    );


    // View Mode //


    const [modeControl, setModeControl] = useControls('View Mode', () : {
        mode: { label : string; value : ViewMode; disabled : boolean; },
        ' ' : ButtonGroupInput
    } => ({
        mode: {
            label: 'Current',
            value: 'side-by-side',
            disabled: true,
        },
        ' ': buttonGroup({
            'side-by-side': () => setModeControl({ mode: 'side-by-side' }),
            'animated': () => setModeControl({ mode: 'animated' }),
            'free': () => setModeControl({ mode: 'free' }),
        }),
    }));

    React.useEffect(() => {
        // Push control updates to store
        setViewMode(modeControl.mode as ViewMode);
    }, [modeControl.mode]);


    // Card Texture //

    const [textureControl, setTextureControl] = useControls('Card Textures', () => ({
        back: {
            label: 'Back',
            options: backs.map(x => x.name)
        },
        border: {
            label: 'Border',
            options: borders.map(x => x.name)
        },
    }));

    React.useEffect(() => {
        // Push control updates to store
        setBack(backs.find(x => x.name === textureControl.back) as Texture);
        setBorder(borders.find(x => x.name === textureControl.border) as Texture);
    }, [textureControl]);


    // Ink Colors //


    const [colorControls, setColorControls] = useControls('Card Ink Color', () => ({
        preset: {
            label: 'Presets',
            options: colors.map(x => x.name),
        },
        name: {
            label: 'Name',
            value: color.name,
        },
        base: {
            label: 'Base',
            hint: 'The base colour of the ink',
            value: color.base,
        },
        specular: {
            label: 'Specular',
            hint: 'The colour of light reflecting on the ink',
            value: color.specular,
        },
        emissive: {
            label: 'Emissive',
            hint: 'The colour emitted by the ink when no light is upon it',
            value: color.emissive,
        },
        'save as new': button(saveNewColor),
    }));

    React.useEffect(() => {
        // Push colour preset changes to store
        const color = colors.find(x => x.name === colorControls.preset) as Color;
        setColor(color);

        // Update scene colours
        colorBase = new THREE.Color(color.base).convertSRGBToLinear();
        colorEmissive = new THREE.Color(color.emissive).convertSRGBToLinear();
        colorSpecular = new THREE.Color(color.specular).convertSRGBToLinear();

        // Update colour controls
        setColorControls(color);
    }, [colorControls.preset]);

    React.useEffect(() => {
        // Update scene colours
        colorBase = new THREE.Color(colorControls.base).convertSRGBToLinear();
        colorEmissive = new THREE.Color(colorControls.emissive).convertSRGBToLinear();
        colorSpecular = new THREE.Color(colorControls.specular).convertSRGBToLinear();

        // Push colour changes to store
        setColor({
            name: colorControls.name,
            specular: colorControls.specular,
            base: colorControls.base,
            emissive: colorControls.emissive,
        });
    }, [colorControls])

    React.useEffect(() => {
        console.log('asdf')
        setColorControls({ preset : { options : colors.map(x => x.name) } })
    }, [backs, borders, colors, color, back, border, setViewMode, setBack, setBorder, setColor, saveNewColor]);
};

export default function StagingPage () {

    return <>
        <Canvas>
            <React.Suspense fallback={<></>}>
                <StagingScene />
            </React.Suspense>
        </Canvas>
    </>
};