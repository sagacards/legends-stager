import React from 'react';
import * as THREE from 'three';
import useStore from 'src/store';

const atmospheres = [
    <hemisphereLight args={["#D29B36", "#E8D66B"]} intensity={1} />,
    <hemisphereLight args={["#8FDFEC", "#AFEFEF"]} intensity={1} />,
    <hemisphereLight args={["#713463", "#B3465D"]} intensity={1} />,
    <hemisphereLight args={["#853AFF", "#0098ED"]} intensity={1} />
];

export function Atmosphere () {
    const { time } = useStore();
    return atmospheres[time]
}

const center = new THREE.Object3D();
center.position.x = 0;
center.position.y = 0;
center.position.z = 0;

export function Sun () {
    const { time } = useStore();
    return <>
        <directionalLight
            intensity={.5}
            position={[0, 0.15, 1]}
            target={center}
        />
        <directionalLight
            intensity={.25}
            position={[1, -1, 2]}
            target={center}
        />
        <directionalLight
            intensity={.25}
            position={[-1, -1, 2]}
            target={center}
        />
        <directionalLight
            intensity={.125}
            position={[1, 1, 1]}
            target={center}
        />
        <directionalLight
            intensity={.125}
            position={[-1, 1, 1]}
            target={center}
        />
    </>
}