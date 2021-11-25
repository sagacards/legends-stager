import React from 'react';
import * as THREE from 'three';
import {
    Canvas, useFrame, useThree
} from '@react-three/fiber';
import { Sun } from 'three/primitives/lights';
import { useCardBacks, useCardBorders } from 'three/primitives/textures';
import { borderNames } from 'three/border-ink';
import { backNames } from 'three/back-ink';
import { Leva, useControls } from 'leva';
import colors from 'src/colors';
import { LegendCard } from 'three/legend-stager';

let colorBase = new THREE.Color(colors[0][1]).convertSRGBToLinear();
let colorSpecular = new THREE.Color(colors[0][2]).convertSRGBToLinear();
let colorEmissive = new THREE.Color(colors[0][3]).convertSRGBToLinear();

function View({ canvas }: { canvas: HTMLCanvasElement | null }) {

    const {
        gl,                           // WebGL renderer
        scene,                        // Default scene
        camera,                       // Default camera
    } = useThree();

    const backs = useCardBacks();
    const [, setBack] = useControls('Ink Patterns', () => ({
        back: {
            value: 0,
            step: 1,
            min: 0,
            max: backs.length - 1,
        },
        backName: {
            label: "name",
            value: "",
            disabled: true,
        },
    }));

    const borders = useCardBorders();
    const [, setBorder] = useControls('Ink Patterns', () => ({
        border: {
            value: 0,
            step: 1,
            min: 0,
            max: borders.length - 1,
        },
        borderName: {
            label: "name",
            value: "",
            disabled: true,
        },
    }));

    const [{ preset, name: inkName }, setColors] = useControls('Ink Color', () => ({
        name: {
            value: "",
            disabled: true,
        },
        preset: {
            value: 0,
            min: 0,
            max: colors.length - 1,
            step: 1,
            label: 'ink',
        },
        base: {
            value: colors[0][1],
        },
        specular: {
            value: colors[0][2],
        },
        emissive: {
            value: colors[0][3],
        },
    }));

    // useFrame(({ gl, scene, camera }) => {
    //     gl.render(scene, camera)
    // }, 1);

    React.useEffect(() => {
        setColors({
            name: colors[preset][0],
            base: colors[preset][1],
            specular: colors[preset][2],
            emissive: colors[preset][3],
        });

        colorBase = new THREE.Color(colors[preset][1]).convertSRGBToLinear();
        colorEmissive = new THREE.Color(colors[preset][3]).convertSRGBToLinear();
        colorSpecular = new THREE.Color(colors[preset][2]).convertSRGBToLinear();

        (window as any).inkName = colors[preset][0].toLocaleLowerCase();
    }, [preset]);

    React.useEffect(() => {
        scene.background = new THREE.Color('#000');
    }, []);

    const [rotation, setRotation] = React.useState<[number, number, number]>([0, 0, 0])

    async function delay(t: number = 50) {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(true), t);
        });
    }

    // @ts-ignore
    const capturer = React.useRef<any>();

    gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
    const i = React.useRef(0);
    const capturing = React.useRef(false);
    const resolver = React.useRef();

    const frames = 60 * 12;

    useFrame(state => {
        setRotation([0, Math.PI * 2 * (i.current / frames), 0]);
        gl.render(scene, camera);
        if (capturing.current === true) {
            i.current++;
            capturer.current.capture(canvas);
            if (i.current === frames) {
                console.log('Done');
                capturing.current = false;
                // @ts-ignore
                capturer.current.stop();
                // @ts-ignore
                capturer.current.save();
                // @ts-ignore
                resolver.current();
            };
        }
    });

    async function saveImage(name : string) {
        if (!canvas) return;

        console.log(`Rendering ${frames} frames...`);

        //@ts-ignore
        capturer.current = new CCapture( {
            format: 'webm',
            quality: 75,
            framerate: 30,
            name
        } )

        i.current = 0;
        requestAnimationFrame(() => gl.render(scene, camera));
        await delay(250);
        capturer.current.start();
        gl.render(scene, camera)
        capturer.current.capture(canvas);
        capturing.current = true;

        return new Promise((resolve) => {
            // @ts-ignore
            resolver.current = resolve;
        });
    }

    async function exportAll() {
        let [i, j, k] = [0, 0, 0];
        const saved: { [key: string]: boolean } = {};
        for (const back of backs) {
            j = k = 0;
            const backName = backNames[i].toLowerCase();
            setBack({ back: i })
            i++;
            for (const border of borders) {
                k = 0;
                const borderName = borderNames[j].toLowerCase();
                setBorder({ border: j });
                j++;
                for (const color of colors) {
                    setColors({ preset: k });
                    const inkName = colors[k][0].toLowerCase();
                    const name = `preview-animated-${backName}-${borderName}-${inkName}`;
                    k++;
                    if (!saved[name]) {
                        console.log(name)
                        console.log(i, j, k)
                        await saveImage(name);
                    };
                };
            };
        };
    }

    (window as any).saveImage = saveImage;
    (window as any).exportAll = exportAll;

    return <React.Suspense fallback={<></>}>
        <group position={[0, 0, .5]}>
            <LegendCard rotation={rotation} />
        </group>
        <Sun />
    </React.Suspense>
};

export default function AnimatedPage() {
    const ref = React.useRef<HTMLCanvasElement>(null);
    return <>
        <Leva
            collapsed
        />
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <div style={{ width: '1000px', height: '1000px' }}>
                <Canvas ref={ref} dpr={2}>
                    <React.Suspense fallback={<></>}>
                        <View canvas={ref.current} />
                    </React.Suspense>
                </Canvas>
            </div>
        </div>
    </>
};