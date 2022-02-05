import { Canvas, createPortal, GroupProps, useFrame, useLoader, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { PresentationControls, TransformControls } from '@react-three/drei'
import React from 'react';
import useStore, { Color, Texture, ViewMode } from 'src/store';
import * as THREE from 'three';
import Card from 'three/card';
import CardInk from 'three/ink';
import colors from 'three/primitives/colors';
import { cardDimensions, textureSize } from 'three/primitives/geometry';
import { SideBySide } from 'three/primitives/lights';
import { useGoldLeafNormal, useTheMagicianLayers } from 'three/primitives/textures';
import shallow from 'zustand/shallow'

let colorBase = new THREE.Color(colors[0].base).convertSRGBToLinear();
let colorSpecular = new THREE.Color(colors[0].specular).convertSRGBToLinear();
let colorEmissive = new THREE.Color(colors[0].emissive).convertSRGBToLinear();
let colorBackground = new THREE.Color(colors[0].background).convertSRGBToLinear();

const center = new THREE.Object3D();
center.position.set(0, 0, 0);

function StagingScene() {

    const store = useStore();

    // Capture render context for exports
    const { gl, camera, scene } = useThree();
    React.useEffect(() => store.setCapture([camera, scene, gl]), []);

    // Initialize stage controls
    useStageControls();

    // Refs
    const mainCard = React.useRef<THREE.Mesh>()
    const secondaryCard = React.useRef<THREE.Mesh>()

    // Main animation loop
    useFrame(state => {

        if (!mainCard.current) return;

        if (store.viewMode === 'side-by-side') {
            mainCard.current.position.set(-1.5, 0, 1);
            mainCard.current.rotation.set(0, -Math.PI * .05, 0);
        } else if (store.viewMode === 'animated') {
            mainCard.current.position.set(0, 0, .5);
            mainCard.current.rotation.set(0, (-state.clock.getElapsedTime() * .62) % (Math.PI * 2) + Math.PI, 0);
        } else {
            mainCard.current.position.set(0, 0, 0);
            mainCard.current.rotation.set(0, 0, 0);
        }

    });

    const x = <group ref={mainCard}>
        <ParallaxCardFace parent={mainCard.current} />
    </group>;

    return <>
        {store.viewMode === 'side-by-side' && <group ref={secondaryCard} position={[1.5, 0, 1]} rotation={[0, Math.PI + Math.PI * .1, 0]}>
            <Card
                materials={<>
                    <meshStandardMaterial attachArray="material" color={"#111"} />
                </>}
                children={<>
                    <CardInk
                        side={THREE.BackSide}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        alpha={useLoader(THREE.TextureLoader, store.back.path)}
                    />
                </>}
            />
        </group>}

        {store.viewMode === 'free'
            ? <group position={[0, 0, 1]}><PresentationControls
                polar={[-Math.PI / 10, Math.PI / 10]}
            >{x}</PresentationControls></group>
            : x
        }
        <mesh position={[0, 0, -1]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial
                normalMap={useGoldLeafNormal()}
                // @ts-ignore
                normalScale={[0.03, 0.03]}
                color={'#000'}
            />
        </mesh>
        <spotLight color={colorBackground} angle={5} penumbra={Math.PI / 4} decay={0} target={center} position={[0, -5, 0]} intensity={5} />
        <SideBySide />
    </>
};

// Renders card art onto card mesh using default camera and a portal to create the depth effect.
const e = 1.2 / 1000; // Factor to normalize art assets to tarot card dimensions
function ParallaxCardFace(props: { parent?: THREE.Mesh }) {
    const store = useStore();
    const scene = React.useRef(new THREE.Scene());
    const target = React.useRef(new THREE.WebGLRenderTarget(textureSize[0], textureSize[1]));
    const camera = React.useRef(
        new THREE.OrthographicCamera(-cardDimensions[0] / 2, cardDimensions[0] / 2, cardDimensions[1] / 2, -cardDimensions[1] / 2)
    );
    React.useEffect(() => void (camera.current.position.z = 20), []);
    useFrame((state) => {
        if (!props.parent) return;
        const rx = props.parent.rotation.x;
        const ry = props.parent.rotation.y;
        const limit = Math.PI * 2;
        const cx = THREE.MathUtils.clamp(
            rx,
            -limit,
            limit
        ) / limit;
        const cy = THREE.MathUtils.clamp(
            ry > Math.PI / 2 ? ry - Math.PI : ry,
            -limit,
            limit
        ) / limit;
        // Position camera
        camera.current.position.x = -cy * 4;
        camera.current.position.y = cx * 4;
        camera.current.lookAt(0, 0, 0);
        // Render
        state.gl.setRenderTarget(target.current);
        state.gl.render(scene.current, camera.current);
        state.gl.setRenderTarget(null);
    });

    return <>
        {createPortal(<ParallaxCardLayers textures={useTheMagicianLayers().map(x => useLoader(THREE.TextureLoader, x.path)).slice(0, 5)} />, scene.current)}
        <Card
            materials={<>
                <meshStandardMaterial attachArray="material" color={"#111"} />
                <meshPhongMaterial
                    attachArray="material"
                    color={colorBase}
                    emissive={colorEmissive}
                    emissiveIntensity={0.125}
                    specular={colorSpecular}
                    shininess={200}
                    normalMap={useGoldLeafNormal()}
                    // @ts-ignore
                    normalScale={[0.03, 0.03]}
                />
                <meshStandardMaterial
                    blending={THREE.NormalBlending}
                    attachArray="material"
                    map={target.current.texture}
                    roughness={.8}
                    metalness={1}
                />
            </>}
            children={<>
                <CardInk
                    side={THREE.FrontSide}
                    color={colorBase}
                    emissive={colorEmissive}
                    specular={colorSpecular}
                    alpha={useLoader(THREE.TextureLoader, store.border.path)}
                />
                <CardInk
                    side={THREE.BackSide}
                    color={colorBase}
                    emissive={colorEmissive}
                    specular={colorSpecular}
                    alpha={useLoader(THREE.TextureLoader, store.back.path)}
                />
            </>}
        />
    </>
};

function ParallaxCardLayers(props: { textures: THREE.Texture[] }) {
    const geometry = React.useMemo(() => new THREE.PlaneGeometry(textureSize[0] * e, textureSize[1] * e), []);
    return (
        <group>
            {props.textures.map((t, i) => <mesh position={[0, 0, (-18 / props.textures.length) * i]} key={`tex${i}`} geometry={geometry}>
                <meshStandardMaterial transparent={true} map={t} />
            </mesh>)}
            <ambientLight intensity={.8} />
        </group>
    );
}


////////////////////////
// Scene Controls UI //
//////////////////////


function useStageControls() {

    const { setViewMode, setBack, setBorder, setColor, setColors, exportAllSideBySide, randomPlay, saveColor, saveNewColor, downloadColors } = useStore(state => ({
        setViewMode: state.setViewMode,
        setBack: state.setBack,
        setBorder: state.setBorder,
        setColor: state.setColor,
        setColors: state.setColors,
        saveNewColor: state.saveNewColor,
        downloadColors: state.downloadColors,
        saveColor: state.saveColor,
        exportAllSideBySide: state.exportAllSideBySide,
        randomPlay: state.randomPlay,
    }), shallow);

    const color = useStore(state => ({ ...state.color }), shallow);
    const backs = useStore(state => ([...state.backs]), shallow);
    const borders = useStore(state => ([...state.borders]), shallow);
    const colors = useStore(state => ([...state.colors]), shallow);


    // View Mode //


    const [modeControl, setModeControl] = useControls(() => ({
        mode: {
            label: 'View Mode',
            options: ['side-by-side', 'animated', 'free']
        },
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


    const [colorOptions, setColorOptions] = React.useState(colors.map(x => x.name));
    const [colorControls, setColorControls] = useControls('Card Ink Color', () => ({
        preset: {
            label: 'Presets',
            options: colorOptions,
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
        background: {
            label: 'Background',
            hint: 'The colour of the backdrop spotlight',
            value: color.background,
        },
        'overwrite colour': button(saveColor),
        'save as new colour': button(saveNewColor),
        'download colours': button(downloadColors),
        'export side-by-sides': button(exportAllSideBySide),
        'random play': button(randomPlay),
    }));

    React.useEffect(() => {
        // Push colour preset changes to store
        const color = colors.find(x => x.name === colorControls.preset) as Color;
        setColor(color);

        // Update colour controls
        setColorControls(color);
    }, [colorControls.preset]);

    React.useEffect(() => {
        // Push colour changes to store
        setColor({
            name: colorControls.name,
            specular: colorControls.specular,
            base: colorControls.base,
            emissive: colorControls.emissive,
            background: colorControls.background,
        });
    }, [colorControls])

    // Update scene colours
    React.useEffect(() => useStore.subscribe((state, prev) => {
        if (!shallowEqual(state.colors, prev.colors)) {
            setColorOptions(colors.map(x => x.name));
            setColorControls({ preset: color.name });
        };
        if (!shallowEqual(state.color, prev.color)) {
            colorBase = new THREE.Color(state.color.base).convertSRGBToLinear();
            colorEmissive = new THREE.Color(state.color.emissive).convertSRGBToLinear();
            colorSpecular = new THREE.Color(state.color.specular).convertSRGBToLinear();
            colorBackground = new THREE.Color(state.color.background).convertSRGBToLinear();
        };
    }), []);
};

export default function StagingPage() {

    return <div style={{ width: '1000px', height: '1000px' }}>
        <Canvas dpr={2}>
            <React.Suspense fallback={<></>}>
                <StagingScene />
            </React.Suspense>
        </Canvas>
    </div>

};

function shallowEqual(object1 : any, object2 : any) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let key of keys1) {
      if (object1[key] !== object2[key]) {
        return false;
      }
    }
    return true;
  }