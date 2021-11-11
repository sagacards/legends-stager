import React from 'react';
import * as THREE from 'three';
import { useSpringRef } from '@react-spring/core';
import { animated, useSpring } from '@react-spring/three';

import { cardSpringConf } from 'three/primitives/springs';
import { useControls } from 'leva';
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
        <meshStandardMaterial color="white" />
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
    const spring = useSpringRef();

    // Initialize spring animated parameters
    // We start the card transparent and down a little bit
    const springProps = useSpring({
        ref: spring,
        opacity: 0,
        position: [0, -0.5, 0],
        config: cardSpringConf
    });

    // Loading animation when component mounts
    React.useEffect(() => {
        spring.start({
            from: { opacity: 0, position: [0, -0.5, 0] },
            to: { opacity: 1, position: [0, 0, 0] },
            config: cardSpringConf
        });
    }, [spring]);

    return <Suspended>
        {/* @ts-ignore: react spring makes typescript complain about its animated values */}
        <animated.group {...springProps}>
            <animated.group {...props}>
                <animated.mesh
                    onPointerEnter={onPointerEnter}
                    onPointerLeave={onPointerLeave}
                    geometry={useCardGeometry()}
                    ref={mesh}
                    castShadow
                    receiveShadow
                >
                    {materials || <animated.meshPhongMaterial
                        transparent
                        opacity={springProps.opacity}
                        color={"#000"}
                    />}
                </animated.mesh>
                {props.children}
            </animated.group>
        </animated.group>
    </Suspended>
};