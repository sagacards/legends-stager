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
import { useControls } from 'leva';

import {
    useLegendBack,
    useLegendBorder,
    useLegendColors,
    useLegendNormal,
    useTheFoolLayers
} from 'three/primitives/textures';
import { cardSpringConf } from 'three/primitives/springs';
import Card from 'three/card';
import { Sun } from 'three/primitives/lights';
import CardInk from './ink';

export interface ClockRef {
    tick: number;        // Counter for number of ticks
    lastTick: number;    // Timestamp of previous tick
    tps: number;         // Ticks per second
    elapsed: number;     // Time elapsed
    prevElapsed: number; // Timestamp of previous frame
    animOffset: number;  // Time spent hover, for smooth pausing
    slowFrames: number;  // Number of frames in a row that have been slow to render
}


// 

const d = [2681, 4191]; // Dimensions of the art assets
const e = 1.41 / 1000; // Factor to normalize art assets to tarot card dimensions
const f = [2.75, 4.75]; // Tarot card dimensions


// Layers comprising the card face, layed out on the Z axis.
function CardArt(props: {textures: THREE.Texture[]}) {

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

// The main card mesh.
function CardMesh({ texture }: { texture: THREE.Texture }) {
    const [colorBase, colorSpecular, colorEmissive] = React.useMemo(useLegendColors, []);
    const normal = React.useMemo(() => useLegendNormal(), []);
    return (
        <Card
            materials={<>
                <meshStandardMaterial attachArray="material" color={"#111"} />
                <meshPhongMaterial
                    attachArray="material"
                    color={colorBase}
                    emissive={colorEmissive}
                    emissiveIntensity={0.125}
                    specular={colorSpecular}
                    // specularMap={nT}
                    shininess={200}
                    // metalness={.75}
                    // roughness={.1}
                    normalMap={normal}
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
                <CardInk
                    side={THREE.FrontSide}
                    color={colorBase}
                    emissive={colorEmissive}
                    specular={colorSpecular}
                    alpha={useLegendBorder()}
                />
                <CardInk
                    side={THREE.BackSide}
                    color={colorBase}
                    emissive={colorEmissive}
                    specular={colorSpecular}
                    alpha={useLegendBack()}
                />
            </>}
        />
    );
}

interface LegendCardProps extends GroupProps {
}

// Renders card art onto card mesh using default camera and a portal to create the depth effect.
function LegendCard({ rotation, ...props }: LegendCardProps) {
    const scene = React.useRef(new THREE.Scene());
    const target = React.useRef(new THREE.WebGLRenderTarget(d[0], d[1]));
    const camera = React.useRef(
        new THREE.OrthographicCamera(-f[0] / 2, f[0] / 2, f[1] / 2, -f[1] / 2)
    );
    const mesh = React.useRef<THREE.Group>();
    React.useEffect(() => void (camera.current.position.z = 20), []);
    useFrame((state) => {
        if (!mesh.current) return;
        if (!document.hasFocus()) return null;

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
            {createPortal(<CardArt textures={useTheFoolLayers().map(([t]) => t)} />, scene.current)}
            <CardMesh texture={target.current.texture} />
        </animated.group>
    );
};

// Applies some preview interactions to the legend card
export function LegendPreview() {

    const { regress } = useThree(state => ({
        regress: state.performance.regress,
        performance: state.performance.current
    }));

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
            0 - THREE.MathUtils.degToRad(mouse.current.x * 5),
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

        if (!document.hasFocus()) return null;

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
                0 - THREE.MathUtils.degToRad(mouse.current.x * 5),
                0
            ] as unknown) as THREE.Vector3,
            position: ([0, 0, .5] as unknown) as THREE.Euler,
            config: {
                mass: 30,
                tension: 300,
                friction: 100
            }
        })
    });

    return <>
        <LegendCard {...props} />
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
            </Canvas>
        </div>
    );
}