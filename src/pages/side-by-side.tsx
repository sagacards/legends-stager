import React from 'react';
import * as THREE from 'three';
import {
    Canvas, useThree
} from '@react-three/fiber';
import { SideBySide } from 'three/primitives/lights';
import Card from 'three/card';
import { useCardBacks, useCardBorders, useLegendNormal, useTheFoolLayers } from 'three/primitives/textures';
import { borderNames, CardBorderInk } from 'three/border-ink';
import { backNames, CardBackInk } from 'three/back-ink';
import { Leva, useControls } from 'leva';
import colors from 'src/colors';

let colorBase = new THREE.Color(colors[0][1]).convertSRGBToLinear();
let colorSpecular = new THREE.Color(colors[0][2]).convertSRGBToLinear();
let colorEmissive = new THREE.Color(colors[0][3]).convertSRGBToLinear();

function View () {
    
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

    const [{ preset, name : inkName }, setColors] = useControls('Ink Color', () => ({
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

    async function delay () {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(true), 100);
        });
    }

    async function saveImage(name: string) {
        await delay();
        gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
        gl.render(scene, camera);
        await gl.domElement.toBlob(
            async function (blob) {
                var a = document.createElement('a');
                var url = await URL.createObjectURL(blob);
                a.href = url;
                a.download = name;
                await a.click();
            },
            'image/png',
            1.0
        )
        gl.domElement.getContext('webgl', { preserveDrawingBuffer: false });
        
    }

    async function exportAll () {
        let [i, j, k] = [0, 0, 0];
        const saved : { [key: string]: boolean } = {};
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
                    const name = `preview-side-by-side-${backName}-${borderName}-${inkName}.png`;
                    k++;
                    if (!saved[name]) {
                        console.log(name)
                        console.log(i, j, k)
                        await saveImage(name);
                        saved[name] = true;
                    };
                };
            };
        };
    }

    React.useEffect(() => {
        (window as any).saveImage = saveImage;
        (window as any).exportAll = exportAll;
    }, [])

    const normal = React.useMemo(() => useLegendNormal(), []);

    return <React.Suspense fallback={<></>}>
        <group position={[1.5, 0, 1]} rotation={[0, Math.PI + Math.PI * .1, 0]}>
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
                        map={useTheFoolLayers('flat')[0]}
                    />
                </>}
                children={<>
                    <CardBorderInk
                        colorBase={colorBase}
                        colorEmissive={colorEmissive}
                        colorSpecular={colorSpecular}
                    />
                    <CardBackInk
                        colorBase={colorBase}
                        colorEmissive={colorEmissive}
                        colorSpecular={colorSpecular}
                    />
                </>}
            />
        </group>
        <group position={[-1.5, 0, 1]} rotation={[0, -Math.PI * .05, 0]}>
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
                        map={useTheFoolLayers('flat')[0]}
                    />
                </>}
                children={<>
                    <CardBorderInk
                        colorBase={colorBase}
                        colorEmissive={colorEmissive}
                        colorSpecular={colorSpecular}
                    />
                    <CardBackInk
                        colorBase={colorBase}
                        colorEmissive={colorEmissive}
                        colorSpecular={colorSpecular}
                    />
                </>}
            />
        </group>
        <SideBySide />
    </React.Suspense>
};

export default function SideBySidePage () {
    const ref = React.useRef<HTMLCanvasElement>(null);
    return <>
        <Leva
            collapsed
        />
        <div style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
                <div style={{width: '100%', height: '100%'}}>
                    <Canvas ref={ref} dpr={2}>
                        <React.Suspense fallback={<></>}>
                            <View />
                        </React.Suspense>
                    </Canvas>
                </div>
        </div>
    </>
};