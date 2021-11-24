import React from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { useCardBorders, useLegendNormal } from './primitives/textures';

interface Props {
    colorBase: THREE.Color;
    colorSpecular: THREE.Color;
    colorEmissive: THREE.Color;
    texture?: THREE.Texture;
};

export const borderNames = [
    'thin',
    'bare',
    'round',
    'staggered',
    'thicc',
    'greek',
    'worn-saxon',
    'saxon',
];

// Gold card border.
export function CardBorderInk(props : Props) {
    const textures = useCardBorders();
    const [{ border }, set] = useControls('Ink Patterns', () => ({
        border: {
            value: 0,
            step: 1,
            min: 0,
            max: textures.length - 1,
        },
        borderName: {
            label: "name",
            value: "",
            disabled: true,
        },
    }));
    const normal = React.useMemo(() => useLegendNormal(), []);
    React.useEffect(() => {
        set({ borderName: borderNames[border] });
        (window as any).borderName = borderNames[border].toLocaleLowerCase();
    }, [border]);
    return (
        <>
            <mesh position={[0, 0, 0.0265]}>
                <planeGeometry args={[2.74, 4.75]} />
                <meshPhongMaterial
                    alphaMap={props.texture || textures[border]}
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
        </>
    );
};