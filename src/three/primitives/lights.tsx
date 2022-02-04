import React from 'react';
import * as THREE from 'three';

const atmospheres = [
    <hemisphereLight args={["#D29B36", "#E8D66B"]} intensity={1} />,
    <hemisphereLight args={["#8FDFEC", "#AFEFEF"]} intensity={1} />,
    <hemisphereLight args={["#713463", "#B3465D"]} intensity={1} />,
    <hemisphereLight args={["#853AFF", "#0098ED"]} intensity={1} />
];

const center = new THREE.Object3D();
center.position.x = 0;
center.position.y = 0;
center.position.z = 0;

export function Sun () {
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
            position={[1, 3, 1]}
            target={center}
        />
        <directionalLight
            intensity={.125}
            position={[-1, 3, 1]}
            target={center}
        />
        <directionalLight
            intensity={.25}
            position={[1, 0, 0]}
            target={center}
        />
        <directionalLight
            intensity={.25}
            position={[-1, 0, 0]}
            target={center}
        />
    </>
}

export function SideBySide () {
    return <>
        <directionalLight
            position={[5, -2.5, 6]}
            intensity={.25}
            target={center}
        />
        <directionalLight
            position={[5, 2.5, 6]}
            intensity={.125}
            target={center}
        />
        <directionalLight
            position={[-3, -1.5, 3]}
            intensity={.25}
            target={center}
        />
        <directionalLight
            position={[-3, 1.5, 3]}
            intensity={.25}
            target={center}
        />
        <directionalLight
            position={[-5, 0, 3]}
            intensity={.125}
            target={center}
        />
    </>
}