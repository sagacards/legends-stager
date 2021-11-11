import React from 'react';
import * as THREE from 'three';
import {
    Canvas,
    createPortal,
    useThree,
    useFrame,
    ThreeEvent,
    GroupProps
} from "@react-three/fiber";
import { useSpring, animated, useSpringRef } from "@react-spring/three";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useControls } from 'leva';

import {
    useCardBacks,
    useCardBorders,
    useGoldLeafNormal,
    useTheFoolLayers
} from 'three/primitives/textures';
import { cardSpringConf } from 'three/primitives/springs';
import Card from 'three/card';
import { Atmosphere, Sun } from 'three/primitives/lights';

import { ClockRef } from './card-table';
import useStore from 'src/store';


// 

const d = [2681, 4191]; // Dimensions of the art assets
const e = 1.41 / 1000; // Factor to normalize art assets to tarot card dimensions
const f = [2.75, 4.75]; // Tarot card dimensions

const colors = [
    [
        'Gold',
        new THREE.Color(0xc1ab59).convertSRGBToLinear(),
        new THREE.Color(0xc1ab59).convertSRGBToLinear(),
        new THREE.Color(0x764007).convertSRGBToLinear(),
    ],
    [
        'Silver',
        new THREE.Color(0xfff3a3).convertSRGBToLinear(),
        new THREE.Color(0xadadad).convertSRGBToLinear(),
        new THREE.Color(0x5f616c).convertSRGBToLinear(),
    ],
    [
        'Copper',
        new THREE.Color(0xa78319).convertSRGBToLinear(),
        new THREE.Color(0x4e230a).convertSRGBToLinear(),
        new THREE.Color(0x000000).convertSRGBToLinear(),
    ],
    [
        'Iridium',
        new THREE.Color(0xb101a6).convertSRGBToLinear(),
        new THREE.Color(0x870193).convertSRGBToLinear(),
        new THREE.Color(0x8800de).convertSRGBToLinear(),
    ],
    [
        'Charteuse',
        new THREE.Color(0x042100).convertSRGBToLinear(),
        new THREE.Color(0x879401).convertSRGBToLinear(),
        new THREE.Color(0x095c05).convertSRGBToLinear(),
    ],
    [
        'Rose',
        new THREE.Color(0xff00ee).convertSRGBToLinear(),
        new THREE.Color(0x4b0000).convertSRGBToLinear(),
        new THREE.Color(0x454225).convertSRGBToLinear(),
    ],
    [
        'Stardust',
        new THREE.Color(0x8000ff).convertSRGBToLinear(),
        new THREE.Color(0x00536c).convertSRGBToLinear(),
        new THREE.Color(0x191224).convertSRGBToLinear(),
    ],
    [
        'Fire',
        new THREE.Color(0xff0000).convertSRGBToLinear(),
        new THREE.Color(0xb40000).convertSRGBToLinear(),
        new THREE.Color(0x720000).convertSRGBToLinear(),
    ],
];

// Layers comprising the card face, layed out on the Z axis.
function CardArt(props: {textures: THREE.Texture[]}) {
    const renders = React.useRef(0);

    const geometry = React.useMemo(() => new THREE.PlaneGeometry(d[0] * e, d[1] * e), []);

    // This scene gives my iPhone trouble when rendering more than two meshes.
    // It seems like a very arbitrary limit, which makes me think I'm doing something bad.
    // For now, what I may do is regress to a two layer parallax.

    return (
        <group>
            {props.textures.map((t, i) => <mesh position={[0, 0, (-20 / props.textures.length) * i]} key={`tex${i}`} geometry={geometry}>
                <meshStandardMaterial transparent={true} map={t} />
            </mesh>)}
            <ambientLight intensity={0.5} />
        </group>
    );
};

// Gold card border.
export function CardBorderInk(props : {texture?: THREE.Texture}) {
    const [border] = useCardBorders();
    const { color } = useControls({
        color: {
            value: 0,
            min: 0,
            max: colors.length - 1,
            step: 1,
        }
    });
    return (
        <>
            <mesh position={[0, 0, 0.0265]}>
                <planeGeometry args={[2.74, 4.75]} />
                <meshPhongMaterial
                    alphaMap={props.texture || border}
                    transparent={true}
                    color={colors[color][3]}
                    emissive={colors[color][1]}
                    emissiveIntensity={0.125}
                    specular={colors[color][2]}
                    // specularMap={nT}
                    shininess={200}
                    // metalness={.75}
                    // roughness={.1}
                    normalMap={useGoldLeafNormal()}
                    // @ts-ignore
                    normalScale={[0.05, 0.05]}
                />
            </mesh>
        </>
    );
};

// Gold card back.
export function CardBackInk(props : {texture?: THREE.Texture}) {
    const [back] = useCardBacks();
    const { color } = useControls({
        color: {
            value: 0,
            min: 0,
            max: colors.length - 1,
            step: 1,
        }
    });
    return (
        <mesh position={[0, 0, -0.026]}>
            <planeGeometry args={[2.74, 4.75]} />
            <meshPhongMaterial
                side={THREE.BackSide}
                alphaMap={props.texture || back}
                transparent={true}
                color={colors[color][3]}
                emissive={colors[color][1]}
                emissiveIntensity={0.125}
                specular={colors[color][2]}
                shininess={200}
                // metalness={.75}
                // roughness={.1}
                normalMap={useGoldLeafNormal()}
                // @ts-ignore
                normalScale={[0.05, 0.05]}
            />
        </mesh>
    );
}

// The main card mesh.
function CardMesh({ texture }: { texture: THREE.Texture }) {
    const { color } = useControls({
        color: {
            value: 0,
            min: 0,
            max: colors.length - 1,
            step: 1,
        }
    });
    return (
        <Card
            materials={<>
                <meshStandardMaterial attachArray="material" color={"#111"} />
                <meshPhongMaterial
                    attachArray="material"
                    color={colors[color][3]}
                    emissive={colors[color][1]}
                    emissiveIntensity={0.125}
                    specular={colors[color][2]}
                    // specularMap={nT}
                    shininess={200}
                    // metalness={.75}
                    // roughness={.1}
                    normalMap={useGoldLeafNormal()}
                    // @ts-ignore
                    normalScale={[0.03, 0.03]}
                />
                <meshStandardMaterial
                    blending={THREE.NormalBlending}
                    attachArray="material"
                    map={texture}
                />
            </>}
            children={<>
                <CardBorderInk />
                <CardBackInk />
            </>}
        />
    );
}

interface LegendCardProps extends GroupProps {
    inView?: boolean;
}

// Renders card art onto card mesh using default camera and a portal to create the depth effect.
function LegendCard({ inView = true, rotation, ...props }: LegendCardProps) {
    const scene = React.useRef(new THREE.Scene());
    const target = React.useRef(new THREE.WebGLRenderTarget(d[0], d[1]));
    const camera = React.useRef(
        new THREE.OrthographicCamera(-f[0] / 2, f[0] / 2, f[1] / 2, -f[1] / 2)
    );
    const mesh = React.useRef<THREE.Group>();
    React.useEffect(() => void (camera.current.position.z = 20), []);
    useFrame((state) => {
        if (!mesh.current) return;
        if (!inView || !document.hasFocus()) return null;

        // Rotate the card
        mesh.current.rotation.y = state.clock.getElapsedTime() * .3;

        // Position camera
        const ry = mesh.current.rotation.y % Math.PI;
        const cy = THREE.MathUtils.clamp(
            ry > Math.PI / 2 ? ry - Math.PI : ry,
            -Math.PI,
            Math.PI
        ) / Math.PI;
        camera.current.position.x = -cy * 4 / 2;
        camera.current.lookAt(0, 0, 0);

        // Render
        state.gl.setRenderTarget(target.current);
        state.gl.render(scene.current, camera.current);
        state.gl.setRenderTarget(null);
    });
    return (
        <animated.group {...props} ref={mesh}>
            {createPortal(<CardArt textures={useTheFoolLayers()} />, scene.current)}
            <CardMesh texture={target.current.texture} />
        </animated.group>
    );
};

// Applies some preview interactions to the legend card
export function LegendPreview({ inView = true }) {

    const { regress } = useThree(state => ({
        regress: state.performance.regress,
        performance: state.performance.current
    }));
    
    // State
    
    const [flip, setFlip] = React.useState(false);

    // Refs

    const mouse = React.useRef({
        x: 0,
        y: 0,
        hover: false
    })

    const clock = React.useRef<ClockRef>({
        tick: 0,
        lastTick: 0,
        tps: 10,
        elapsed: 0,
        prevElapsed: 0,
        animOffset: 0,
        slowFrames: 0,
    });
    
    // Animation Springs

    const spring = useSpringRef();
    
    const springProps = useSpring({
        ref: spring,
        rotation: ([
            THREE.MathUtils.degToRad(0 + mouse.current.y * 5),
            (flip ? 0 : Math.PI) - THREE.MathUtils.degToRad(mouse.current.x * 5),
            0
        ] as unknown) as THREE.Vector3,
        position: ([0, 0, mouse.current.hover ? 0.1 : 0] as unknown) as THREE.Euler,
        config: cardSpringConf
    });

    const hoverBox = React.useMemo(() => new THREE.Box3(), []);

    function hoverTilt(e: ThreeEvent<PointerEvent>) {
        hoverBox.setFromObject(e.eventObject);
        mouse.current.x = e.point.x >= 0 ? e.point.x / hoverBox.max.x : -e.point.x / hoverBox.min.x;
        mouse.current.y = e.point.y >= 0 ? e.point.y / hoverBox.max.y : -e.point.y / hoverBox.min.y;
    }

    const props = {
        ...springProps,
        onPointerMove: hoverTilt,
        onPointerEnter: () => mouse.current.hover = true,
        onPointerLeave: () => {
            mouse.current.hover = false;
            mouse.current.x = 0;
            mouse.current.y = 0;
        }
    };

    // Leva UI just for some diagnostics
    const renders = React.useRef(0);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        const c = clock.current;
        c.prevElapsed = c.elapsed;
        c.elapsed = t;

        if (!inView || !document.hasFocus()) return null;

        // Regress quality based on subsequent slow frame renders
        const fps = 1 / (c.elapsed - c.prevElapsed);
        if (fps < 30) {
            c.slowFrames++;
            // regress();
        } else {
            c.slowFrames = 0;
        }

        // Dynamically set pixel density based on performance
        if (state.performance.current < 1) {
            state.setDpr(1);
        } else {
            state.setDpr(window.devicePixelRatio);
        }

        spring.start({
            rotation: ([
                THREE.MathUtils.degToRad(0 + mouse.current.y * 5),
                (flip ? 0 : Math.PI) - THREE.MathUtils.degToRad(mouse.current.x * 5),
                0
            ] as unknown) as THREE.Vector3,
            position: ([0, 0, mouse.current.hover ? 0.1 : 0] as unknown) as THREE.Euler,
            config: {
                mass: 30,
                tension: 300,
                friction: 100
            }
        })
    });

    return <>
        <LegendCard {...props} inView={inView} onClick={() => {
            setFlip(!flip);
        }} />
    </>;
}

export default function LegendPreviewCanvas() {
    const dpr = React.useRef(window.devicePixelRatio);
    return (
        <div className="canvasContainer" style={{width: '100%', height: '100%'}}>
            <Canvas
                dpr={dpr.current}
                camera={{ zoom: 1 }}
                performance={{ min: .1, max: 1, debounce: 10000}}
                mode="concurrent"
            >
                <React.Suspense fallback={<></>}>
                    <LegendPreview />
                </React.Suspense>
                <Sun />
                <Atmosphere />
                {/* <EffectComposer>
                    <Bloom intensity={0.05} luminanceThreshold={0} />
                </EffectComposer> */}
            </Canvas>
        </div>
    );
}