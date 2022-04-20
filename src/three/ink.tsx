import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import {
    useAcrylicNormal,
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
    normal?: THREE.Texture | false;
    shininess?: number;
    material?: 'phong' | 'standard';
};

export default function CardInk({
    alpha,
    color,
    emissive,
    specular,
    side,
    normal,
    shininess,
    material = 'phong',
} : Props) {
    const [border] = useCardBorders();
    const f = useLoader(THREE.TextureLoader, border.path)
    const z = normal === false ? null : useGoldLeafNormal();
    return (
        <>
            <mesh position={[0, 0, 0.007 * (side === THREE.BackSide ? -1 : 1)]}>
                <planeGeometry args={[2.75, 4.75]} />
                {material === 'phong' ? <meshPhongMaterial
                    alphaMap={alpha || f}
                    transparent={true}
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={0.125}
                    specular={specular}
                    shininess={shininess || 200}
                    normalMap={z}
                    // @ts-ignore
                    normalScale={[0.05, 0.05]}
                    side={side || THREE.FrontSide}
                /> : <meshStandardMaterial
                    alphaMap={alpha || f}
                    transparent={true}
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={0.125}
                    specular={specular}
                    shininess={shininess || 200}
                    normalMap={z}
                    // @ts-ignore
                    normalScale={[0.05, 0.05]}
                    side={side || THREE.FrontSide}
                />}
            </mesh>
        </>
    );
};