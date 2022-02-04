import * as THREE from 'three';
import {
    useGoldLeafNormal,
    useCardBorders,
} from 'three/primitives/textures';

// A material plane set just on top of the face of the card.

interface Props {
    alpha?: THREE.Texture;
    color: THREE.Color;
    emissive: THREE.Color;
    specular: THREE.Color;
    side?: THREE.Side;
};

export default function CardInk({
    alpha,
    color,
    emissive,
    specular,
    side,
} : Props) {
    const [[border]] = useCardBorders();
    return (
        <>
            <mesh position={[0, 0, 0.0265 * (side === THREE.BackSide ? -1 : 1)]}>
                <planeGeometry args={[2.75, 4.75]} />
                <meshPhongMaterial
                    alphaMap={alpha || border}
                    transparent={true}
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={0.125}
                    specular={specular}
                    shininess={200}
                    normalMap={useGoldLeafNormal()}
                    // @ts-ignore
                    normalScale={[0.05, 0.05]}
                    side={side || THREE.FrontSide}
                />
            </mesh>
        </>
    );
};