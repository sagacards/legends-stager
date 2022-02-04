import React from 'react';
import * as THREE from 'three';
import {
    Canvas, useThree
} from '@react-three/fiber';
import { SideBySide } from 'three/primitives/lights';
import Card from 'three/card';
import { useCardBacks, useCardBorders, useLegendNormal, useTheMagicianFlat } from 'three/primitives/textures';
import CardInk from 'three/ink';
import { Leva, useControls, button, buttonGroup } from 'leva';
import colors from 'three/primitives/colors';
import variants from 'src/variants';

let _colors = colors;

let colorBase = new THREE.Color(_colors[0][1]).convertSRGBToLinear();
let colorSpecular = new THREE.Color(_colors[0][2]).convertSRGBToLinear();
let colorEmissive = new THREE.Color(_colors[0][3]).convertSRGBToLinear();

function View () {
    
    const {
        gl,     // WebGL renderer
        scene,  // Default scene
        camera, // Default camera
    } = useThree();

    // @ts-ignore
    const [viewMode, setViewMode] = useControls('View Mode', () => ({
        Mode: 'Side-by-side',
        ' ': buttonGroup({
            'Side-by-side': () => setViewMode({ Mode: 'Side-by-side' }),
            'Animated': () => setViewMode({ Mode: 'Animated' }),
            'Free': () => setViewMode({ Mode: 'Free' }),
        })
    }));

    const backs = useCardBacks();
    const [{back : backI}, setBack] = useControls('Ink Patterns', () => ({
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
    const [{border : borderI}, setBorder] = useControls('Ink Patterns', () => ({
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

    const [{ preset, name : inkName, base, specular, emissive }, setColors] = useControls('Ink Color', () => ({
        name: {
            value: "",
            disabled: true,
        },
        preset: {
            value: 0,
            min: 0,
            max: _colors.length - 1,
            step: 1,
            label: 'ink',
        },
        base: {
            value: _colors[0][1],
        },
        specular: {
            value: _colors[0][2],
        },
        emissive: {
            value: _colors[0][3],
        },
        'save as new': button(() => {
            _colors = [..._colors, [`#${_colors.length}`, `#${colorBase.convertLinearToSRGB().getHexString()}`, `#${colorSpecular.convertLinearToSRGB().getHexString()}`, `#${colorEmissive.convertLinearToSRGB().getHexString()}`, `${backI}`, `${borderI}`]]
            window.localStorage.setItem('colors', JSON.stringify(_colors))
        })
    }));

    React.useEffect(() => {
        setColors({
            name: _colors[preset][0],
            base: _colors[preset][1],
            specular: _colors[preset][2],
            emissive: _colors[preset][3],
        });

        colorBase = new THREE.Color(_colors[preset][1]).convertSRGBToLinear();
        colorEmissive = new THREE.Color(_colors[preset][3]).convertSRGBToLinear();
        colorSpecular = new THREE.Color(_colors[preset][2]).convertSRGBToLinear();

        (window as any).inkName = _colors[preset][0].toLocaleLowerCase();
    }, [preset]);

    React.useEffect(() => {
        colorBase = new THREE.Color(base).convertSRGBToLinear();
        colorEmissive = new THREE.Color(emissive).convertSRGBToLinear();
        colorSpecular = new THREE.Color(specular).convertSRGBToLinear();
    }, [base, specular, emissive])

    React.useEffect(() => {
        scene.background = new THREE.Color('#000');
    }, []);

    React.useEffect(() => {
        setBorder({ borderName: borders[borderI][1] });
        (window as any).borderName = borders[borderI][1].toLocaleLowerCase();
    }, [borderI]);

    React.useEffect(() => {
        setBack({ backName: backs[backI][1] });
        (window as any).backName = backs[backI][1].toLocaleLowerCase();
    }, [backI]);

    async function delay () {
        return new Promise<any>((resolve) => {
            setTimeout(() => resolve(true), 250);
        });
    }

    async function saveImage(name: string) {
        await delay();
        gl.domElement.getContext('webgl', { preserveDrawingBuffer: true });
        gl.render(scene, camera);
        await gl.domElement.toBlob(
            async function (blob) {
                if (!blob) return;
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
                    const inkName = _colors[k][0].toLowerCase();
                    const name = `preview-side-by-side-${back[1]}-${border[1]}-${inkName}.png`;
                    k++;
                    if (variants.includes(`${border[1]}-${back[1]}-${inkName}`)) {
                        console.log(`render ${border[1]}-${back[1]}-${inkName}`);
                        await saveImage(name);
                    }
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
                </>}
                children={<>
                    <CardInk
                        side={THREE.FrontSide}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        alpha={borders[borderI][0]}
                    />
                    <CardInk
                        side={THREE.BackSide}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        alpha={backs[backI][0]}
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
                        map={useTheMagicianFlat()}
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
                        alpha={borders[borderI][0]}
                    />
                    <CardInk
                        side={THREE.BackSide}
                        color={colorBase}
                        emissive={colorEmissive}
                        specular={colorSpecular}
                        alpha={backs[backI][0]}
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
                <div style={{width: '1000px', height: '1000px'}}>
                    <Canvas ref={ref} dpr={2}>
                        <React.Suspense fallback={<></>}>
                            <View />
                        </React.Suspense>
                    </Canvas>
                </div>
        </div>
    </>
};