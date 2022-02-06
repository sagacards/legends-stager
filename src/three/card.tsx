import React from 'react';
import * as THREE from 'three';
import { GroupProps, useFrame } from '@react-three/fiber';
import { useCardGeometry } from './primitives/geometry';

//////////////////////////////////////////////////
// A configurable tarot card                    //
//////////////////////////////////////////////////

// To force a fake loading delay, so that we can feel our loading animations
const Timeout = React.lazy(() => {
    return new Promise<any>((resolve) => {
        setTimeout(() => resolve({ default: () => <></> }), 10000 * Math.random());
    });
});

// 
export function Loader () {
    const mesh = React.useRef<THREE.Mesh>(null);

    useFrame(state => {
        if (!mesh.current) return;
        mesh.current.rotation.y = state.clock.getElapsedTime();
        mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime());
    });

    return <mesh ref={mesh}>
        <torusGeometry args={[.5, .1, 10, 25]} />
        <meshStandardMaterial color="#121212" />
    </mesh>
}

// I found that, for some reason, handling suspense in a wrapper fixed some animations.
export function Suspended (props : { children : React.ReactNode }) {
    return (
        <React.Suspense fallback={<Loader />}>
            <Timeout />
            {props.children}
        </React.Suspense>
    );
}

/////////////////////////////////////////////////
// The main card component                     //
/////////////////////////////////////////////////

interface CardProps extends GroupProps {
    materials?: React.ReactNode;
}

export default function Card ({
    onPointerEnter,
    onPointerLeave,
    materials,
    ...props
} : CardProps) {

    const mesh = React.useRef<THREE.Mesh>();

    return <Suspended>
        <group>
            <group {...props}>
                <mesh
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                    geometry={useCardGeometry()}
                    ref={mesh}
                    castShadow
                    receiveShadow
                >
                    {materials || <meshPhongMaterial
                        transparent
                        color={"#000"}
                    />}
                </mesh>
                {props.children}
            </group>
        </group>
    </Suspended>
};