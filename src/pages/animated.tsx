import React from 'react';
import * as THREE from 'three';
import {
    Canvas, useFrame, useThree
} from '@react-three/fiber';
import { Sun } from 'three/primitives/lights';
import { useCardBacks, useCardBorders } from 'three/primitives/textures';
import { Leva, useControls } from 'leva';
import colors from 'src/colors';
import { LegendCard } from 'three/legend-stager';
//@ts-ignore
import WebMWriter from 'webm-writer';
//@ts-ignore
import download from 'downloadjs';
import variants from 'src/variants';

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

    useFrame(({ gl, scene, camera }) => {
        gl.render(scene, camera)
    }, 1);

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
        gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
    }, []);

    const [rotation, setRotation] = React.useState<[number, number, number]>([0, 0, 0])

    async function delay(t: number = 50) {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(true), t);
        });
    }
    
    const i = React.useRef(0);
    const resolver = React.useRef<() => void>();
    const frames = 60 * 12;

    async function saveImage(name : string) {
        if (!canvas) return;
        const start = new Date();
        console.log(`${start.toLocaleTimeString()} Rendering ${frames} frames...`);
        
        const capturer = new WebMWriter({
            quality: 0.75,
            frameRate: 30,
        });

        i.current = -60;
        
        function render () {
            setRotation([0, Math.PI * 2 * (i.current / frames), 0]);
            gl.render(scene, camera);
            i.current++;
            if (i.current >= 0) capturer.addFrame(canvas);
            if (i.current < frames) {
                requestAnimationFrame(render);
            } else {
                capturer.complete()
                .then(function(blob : any) {
                    download(blob, name, 'video/webm');
                });
                console.log(`Done. Took ${(new Date().getTime() - start.getTime()) / 1000} seconds.`)
                if (resolver.current) resolver.current();
            }
        }

        render();

        return new Promise<void>(resolve => resolver.current = resolve);
    }

    async function exportAll() {
        let [i, j, k] = [0, 0, 0];
        for (const back of backs) {
            j = k = 0;
            setBack({ back: i })
            i++;
            for (const border of borders) {
                k = 0;
                setBorder({ border: j });
                j++;
                for (const color of colors) {
                    setColors({ preset: k });
                    const inkName = colors[k][0].toLowerCase();
                    if (variants.includes(`${border[1]}-${back[1]}-${inkName}`)) {
                        console.log(`render ${back[1]}-${border[1]}-${inkName}`);
                        await saveImage(`preview-animated-${back[1]}-${border[1]}-${inkName}`);
                    }
                    k++;
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
