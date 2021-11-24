import React from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useCardBacks, useLegendNormal } from './primitives/textures';

interface Props {
    colorBase: THREE.Color;
    colorSpecular: THREE.Color;
    colorEmissive: THREE.Color;
    texture?: THREE.Texture;
};

export const backNames = [
    'fate',
    'bordered-saxon',
    'worn-saxon',
    'saxon',
];

// Gold card back.
export function CardBackInk(props : Props) {
    const textures = useCardBacks();
    const normal = React.useMemo(() => useLegendNormal(), []);
    const [{ back }, set] = useControls('Ink Patterns', () => ({
        back: {
            value: 0,
            step: 1,
            min: 0,
            max: textures.length - 1,
        },
        backName: {
            label: "name",
            value: "",
            disabled: true,
        },
    }));
    React.useEffect(() => {
        set({ backName: backNames[back] });
        (window as any).backName = backNames[back].toLocaleLowerCase();
    }, [back]);
    return (
        <mesh position={[0, 0, -0.026]}>
            <planeGeometry args={[2.74, 4.75]} />
            <meshPhongMaterial
                side={THREE.BackSide}
                alphaMap={props.texture || textures[back]}
                transparent={true}
                color={props.colorBase}
                emissive={props.colorEmissive}
                emissiveIntensity={0.125}
                specular={props.colorSpecular}
                shininess={200}
                normalMap={normal}
                // @ts-ignore
                normalScale={[0.05, 0.05]}
            />
        </mesh>
    );
}