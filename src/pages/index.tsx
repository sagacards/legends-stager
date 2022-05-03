import { Canvas, createPortal, useFrame, useLoader, useThree } from '@react-three/fiber';
import { button, useControls } from 'leva';
import { PresentationControls } from '@react-three/drei'
import React from 'react';
import useStore, { ViewMode } from 'src/store';
import * as THREE from 'three';
import Card from 'three/card';
import CardInk from 'three/ink';
import { cardDimensions, textureSize } from 'three/primitives/geometry';
import { SideBySide, Sun } from 'three/primitives/lights';
import { useGoldLeafNormal } from 'three/primitives/textures';
import shallow from 'zustand/shallow'
import { Color, defaultSeries, getData, seriesIdentifiers, Texture, stocks, dumpManifest, Stock } from 'data/index'
import { animated, useSpring, useSpringRef } from '@react-spring/three';
import { cardSpringConf } from 'three/primitives/springs';

const { colors : defaultColors, } = await getData(defaultSeries);

let colorBase = new THREE.Color(defaultColors[0].base).convertSRGBToLinear();
let colorSpecular = new THREE.Color(defaultColors[0].specular).convertSRGBToLinear();
let colorEmissive = new THREE.Color(defaultColors[0].emissive).convertSRGBToLinear();
let colorBackground = new THREE.Color(defaultColors[0].background).convertSRGBToLinear();

let stockBase = new THREE.Color(stocks[0].base).convertSRGBToLinear();
let stockSpecular = new THREE.Color(stocks[0].specular).convertSRGBToLinear();
let stockEmissive = new THREE.Color(stocks[0].emissive).convertSRGBToLinear();

const lights = [SideBySide, Sun];

const center = new THREE.Object3D();
center.position.set(0, 0, 0);

function StagingScene() {

    const store = useStore();

    // Capture render context for exports
    const { gl, camera, scene } = useThree();
    React.useEffect(() => {
        store.setCapture({ camera, scene, gl })
    }, []);

    // Initialize stage controls
    const [modeControl] = useStageControls();

    // Refs
    const mainCard = React.useRef<THREE.Mesh>()
    const secondaryCard = React.useRef<THREE.Mesh>()
    const springRef = useSpringRef();
    const spring = useSpring({
        ref: springRef,
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        config: cardSpringConf,
    });
    const flip = React.useRef<boolean>(false);
    const _phase = React.useRef<number>(0);
    
    // Main animation loop
    useFrame(state => {

        if (!mainCard.current) return;

        if (store.exporting && store.rotation) {
            mainCard.current.position.set(0, 0, .5);
            mainCard.current.rotation.set(...store.rotation);
        } else if (store.viewMode === 'side-by-side') {
            mainCard.current.position.set(-1.5, 0, 1);
            mainCard.current.rotation.set(0, -Math.PI * .05, 0);
        } else if (store.viewMode === 'animated') {
            mainCard.current.position.set(0, 0, .5);
            mainCard.current.rotation.set(0, (-state.clock.getElapsedTime() * .62) % (Math.PI * 2) + Math.PI, 0);
        } else if (store.viewMode === 'pivot') {
            mainCard.current.position.set(0, 0, .5);
            mainCard.current.rotation.set(0, Math.sin(-state.clock.getElapsedTime()) * Math.PI * .10, 0);
        } else {
            mainCard.current.position.set(0, 0, 0);
            mainCard.current.rotation.set(0, 0, 0);
        }

    });

    const x = <group ref={mainCard}>
        <ParallaxCardFace parent={mainCard.current} />
    </group>;

    const back = store.back.name === 'back-cinematic' ? <CardInk
        side={THREE.BackSide}
        color={colorBase}
        emissive={colorEmissive}
        specular={colorSpecular}
        normal={false}
        alpha={useLoader(THREE.TextureLoader, store.back.path)}
    /> : <CardInk
        side={THREE.BackSide}
        color={colorBase}
        emissive={colorEmissive}
        specular={colorSpecular}
        alpha={useLoader(THREE.TextureLoader, store.back.path)}
    />

    const stockMaterial = React.useMemo(() => store.stock.material === 'phong'
        ? <meshPhongMaterial attachArray="material" color={stockBase} emissive={stockEmissive} specular={stockSpecular} />
        : <meshStandardMaterial attachArray="material" color={stockBase} emissive={stockEmissive} />
    , [store.stock]);

    return <>
        {store.viewMode === 'side-by-side' && <group ref={secondaryCard} position={[1.5, 0, 1]} rotation={[0, Math.PI + Math.PI * .1, 0]}>
            <Card
                materials={<>
                    {stockMaterial}
                </>}
                children={<>
                    {back}
                </>}
            />
        </group>}

        {store.viewMode === 'free'
            ? <group position={[0, 0, 1]} rotation={[0, 0, 0]}><PresentationControls
                polar={[-Math.PI / 10, Math.PI / 10]}
            >{x}</PresentationControls></group>
            : x
        }
        {modeControl.background && <mesh position={[0, 0, -1]}>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial
                normalMap={useGoldLeafNormal()}
                // @ts-ignore
                normalScale={[0.03, 0.03]}
                color={'#000'}
            />
        </mesh>}
        <spotLight color={colorBackground} angle={5} penumbra={Math.PI / 4} decay={0} target={center} position={[0, -5, 0]} intensity={5} />
        {lights[modeControl.lights]()}
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
    React.useEffect(() => {
        scene.current.background = new THREE.Color(store.sceneBackground).convertSRGBToLinear()
        camera.current.position.z = 20;
    }, [store.sceneBackground]);
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

    const parallaxLayers = React.useMemo(() => {
        const layers = store.cardArt.map(x => useLoader(THREE.TextureLoader, x.path));
        return layers
    }, [store.cardArt]);

    const stockMaterial = React.useMemo(() => store.stock.material === 'phong'
        ? <meshPhongMaterial attachArray="material" color={stockBase} emissive={stockEmissive} specular={stockSpecular} />
        : <meshStandardMaterial attachArray="material" color={stockBase} emissive={stockEmissive} />
    , [store.stock]);
    
    // TODO: Ink textures
    const back = store.back.name === 'back-cinematic' ? <CardInk
        side={THREE.BackSide}
        color={colorBase}
        emissive={colorEmissive}
        specular={colorSpecular}
        normal={false}
        alpha={useLoader(THREE.TextureLoader, store.back.path)}
    /> : <CardInk
        side={THREE.BackSide}
        color={colorBase}
        emissive={colorEmissive}
        specular={colorSpecular}
        alpha={useLoader(THREE.TextureLoader, store.back.path)}
    />;

    const border = <CardInk
        side={THREE.FrontSide}
        color={colorBase}
        emissive={colorEmissive}
        specular={colorSpecular}
        alpha={useLoader(THREE.TextureLoader, store.border.path)}
    />;

    const mask = store?.mask?.path && <group position={[0, 0, -.001]}>
        <CardInk
            side={THREE.FrontSide}
            color={stockBase}
            emissive={stockEmissive}
            specular={stockSpecular}
            alpha={useLoader(THREE.TextureLoader, store.mask.path)}
            normal={false}
            material={store.stock.material as 'phong' | 'standard'}
        />
    </group>;

    const scale = store.border.name === 'border-cinematic' ? .85 : 1;

    return <>
        {createPortal(<ParallaxCardLayers scale={scale} textures={parallaxLayers} />, scene.current)}
        <Card
            materials={<>
                {stockMaterial}
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
                {border}
                {mask}
                {back}
            </>}
        />
    </>
};

function ParallaxCardLayers(props: { textures: THREE.Texture[], scale?: number }) {
    const geometry = React.useMemo(() => new THREE.PlaneGeometry(textureSize[0] * e * (props.scale || 1), textureSize[1] * e * (props.scale || 1)), []);
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

    const {
        setSeries,
        setCardArt,
        setViewMode,
        setBack,
        setBorder,
        setMask,
        setColor,
        setColors,
        setStock,
        saveStock,
        downloadStocks,
        saveAllStatic,
        randomPlay,
        saveColor,
        saveNewColor,
        downloadColors,
        saveAllAnimated,
        setVariant,
        setVariants,
        addVariant,
        saveVariant,
        downloadVariants,
        saveStatic,
        saveAnimated,
        exportSampler,
        exportPivot,
    } = useStore(state => ({
        setSeries: state.setSeries,
        setCardArt: state.setCardArt,
        setViewMode: state.setViewMode,
        setBack: state.setBack,
        setBorder: state.setBorder,
        setMask: state.setMask,
        setColor: state.setColor,
        setColors: state.setColors,
        setStock: state.setStock,
        saveStock: state.saveStock,
        downloadStocks: state.downloadStocks,
        saveNewColor: state.saveNewColor,
        downloadColors: state.downloadColors,
        saveColor: state.saveColor,
        saveAllStatic: state.saveAllStatic,
        randomPlay: state.randomPlay,
        saveAllAnimated: state.saveAllAnimated,
        setVariant: state.setVariant,
        setVariants: state.setVariants,
        addVariant: state.addVariant,
        saveVariant: state.saveVariant,
        downloadVariants: state.downloadVariants,
        saveStatic: state.saveStatic,
        saveAnimated: state.saveAnimated,
        exportSampler: state.exportSampler,
        exportPivot: state.exportPivot,
    }), shallow);

    const color = useStore(state => ({ ...state.color }), shallow);
    const back = useStore(state => (state.back), shallow);
    const backs = useStore(state => ([...state.backs]), shallow);
    const border = useStore(state => (state.border), shallow);
    const borders = useStore(state => ([...state.borders]), shallow);
    const colors = useStore(state => ([...state.colors]), shallow);
    const variants = useStore(state => ([...state.variants]), shallow);
    const masks = useStore(state => ([...state.masks]), shallow);
    const stock = useStore(state => ({ ...state.stock }), shallow);
    const stocks = useStore(state => ([...state.stocks]), shallow);


    // Series //


    const [seriesControls, setSeriesControls] = useControls('Series', () => ({
        series: {
            label: 'Series',
            value: defaultSeries,
            options: seriesIdentifiers,
        }
    }));

    React.useEffect(() => {
        getData(seriesControls.series).then(({ colors, variants, cardArt }) => {
            // Push series updates to store
            setColors(colors);
            setVariants(variants);
            setVariant(variants[0]);
            setCardArt(cardArt);
            setSeries(seriesControls.series);

            // Update control UI
            setColorOptions(colors.map(x => x.name));
        });
    }, [seriesControls]);


    // View Mode //


    const [modeControl, setModeControl] = useControls('Scene', () => ({
        mode: {
            label: 'View Mode',
            options: ['side-by-side', 'animated', 'free', 'pivot']
        },
        background: {
            label: 'Show BG',
            value: true
        },
        lights: {
            label: 'Lights',
            value: 0,
            max: lights.length - 1,
            min: 0,
            step: 1
        }
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
        mask: {
            label: 'Mask',
            options: [undefined, ...masks.map(x => x.name)],
        },
    }));

    React.useEffect(() => {
        // Push control updates to store
        setBack(backs.find(x => x.name === textureControl.back) as Texture);
        setBorder(borders.find(x => x.name === textureControl.border) as Texture);
        setMask(masks.find(x => x.name === textureControl.mask) as Texture);
    }, [textureControl]);


    // Card Stock //


    const  [stockControl, setStockControl] = useControls('Card Stock', () => ({
        stock : {
            label: 'Stock',
            options: stocks.map(x => x.name),
        },
        base: {
            label: 'Base',
            hint: 'The base colour of the ink',
            value: stock.base,
        },
        specular: {
            label: 'Specular',
            hint: 'The colour of light reflecting on the ink',
            value: stock.specular,
        },
        emissive: {
            label: 'Emissive',
            hint: 'The colour emitted by the ink when no light is upon it',
            value: stock.emissive,
        },
        material: {
            label: 'Material',
            hint: 'The colour of the backdrop spotlight',
            value: stock.material,
            options: ['phong', 'standard'],
        },
        'overwrite stock': button(saveStock),
        'download stocks': button(downloadStocks),
    }), [stocks]);

    React.useEffect(() => {
        // Push colour preset changes to store
        const stock = stocks.find(x => x.name === stockControl.stock) as Stock;
        if (stock === undefined) return;
        setStock(stock);

        // Update colour controls
        setStockControl({
            stock: stock.name,
            base: stock.base,
            emissive: stock.emissive,
            specular: stock.specular,
            material: stock.material,
        });
    }, [stocks, stockControl.stock]);

    React.useEffect(() => {
        setStock({
            name: stockControl.stock,
            base: stockControl.base,
            emissive: stockControl.emissive,
            specular: stockControl.specular,
            material: stockControl.material,
        });
    }, [stockControl]);

    // Update scene colours
    React.useEffect(() => useStore.subscribe((state, prev) => {
        if (!shallowEqual(state.stocks, prev.stocks)) {
            setStockControl({ stock: state.stock.name });
        };
        if (!shallowEqual(state.stock, prev.stock)) {
            stockBase = new THREE.Color(state.stock.base).convertSRGBToLinear();
            stockEmissive = new THREE.Color(state.stock.emissive).convertSRGBToLinear();
            stockSpecular = new THREE.Color(state.stock.specular).convertSRGBToLinear();
        };
        if (!shallowEqual(state.variant, prev.variant)) {
            setStockControl({ stock: state.stock.name });
        };
    }), []);


    // Ink Colors //


    const [colorOptions, setColorOptions] = React.useState(colors.map(x => x.name));
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
        background: {
            label: 'Background',
            hint: 'The colour of the backdrop spotlight',
            value: color.background,
        },
        'overwrite colour': button(saveColor),
        'save as new colour': button(saveNewColor),
        'download colours': button(downloadColors),
    }), [colors, colorOptions]);

    React.useEffect(() => {
        // Push colour preset changes to store
        const color = colors.find(x => x.name === colorControls.preset) as Color;
        if (color === undefined) return;
        setColor(color);

        // Update colour controls
        setColorControls(color);
    }, [colors, colorControls.preset]);

    React.useEffect(() => {
        // Push colour changes to store
        setColor({
            name: colorControls.name,
            specular: colorControls.specular,
            base: colorControls.base,
            emissive: colorControls.emissive,
            background: colorControls.background,
        });
    }, [colorControls]);

    // Update scene colours
    React.useEffect(() => useStore.subscribe((state, prev) => {
        if (!shallowEqual(state.colors, prev.colors)) {
            setColorOptions(colors.map(x => x.name));
            setColorControls({ preset: state.color.name });
        };
        if (!shallowEqual(state.color, prev.color)) {
            colorBase = new THREE.Color(state.color.base).convertSRGBToLinear();
            colorEmissive = new THREE.Color(state.color.emissive).convertSRGBToLinear();
            colorSpecular = new THREE.Color(state.color.specular).convertSRGBToLinear();
            colorBackground = new THREE.Color(state.color.background).convertSRGBToLinear();
        };
        if (!shallowEqual(state.variant, prev.variant)) {
            setColorControls({ preset: state.color.name });
            setTextureControl({ back : state.back.name, border : state.border.name, mask : state.mask?.name, })
        };
    }), [colorOptions]);


    // Variants //


    const [variantControls, setVariantControls] = useControls('Variants', () => ({
        variant: {
            label: 'Variant',
            value: 0,
            min: 0,
            max: variants.length - 1,
            step: 1,
        },
        'add variant': button(addVariant),
        'save variant': button(saveVariant),
        'download variants': button(downloadVariants),
    }), [variants]);

    React.useEffect(() => {
        if (!variants) return;
        setVariant(variants[variantControls.variant]);
    }, [variantControls]);

    // React.useEffect(() => {
    //     setVariantControls({ variant : variants.length - 1 })
    // }, [variants])


    // Exporting //


    useControls('Export', () => ({
        'export all side-by-sides': button(saveAllStatic),
        'export all animated': button(saveAllAnimated),
        'export side-by-side': button(saveStatic),
        'export animated': button(saveAnimated),
        'random play': button(randomPlay),
        'export sampler': button(exportSampler),
        'export manifest': button(() => console.log(dumpManifest(variants))),
        'export pivot': button(exportPivot),
    }));

    // Keyboard Controls //

    React.useEffect(() => {
        document.onkeyup = (e) => {
            if (e.key === 'ArrowRight') {
                setVariantControls({ variant: variantControls.variant + 1 });
            } else if (e.key === 'ArrowLeft') {
                setVariantControls({ variant: variantControls.variant - 1 });
            };
        };
    }, [variantControls]);

    return [modeControl]
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