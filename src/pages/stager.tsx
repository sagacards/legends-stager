import { Leva } from 'leva';
import React from 'react';
import LegendStagerCanvas from 'three/legend-stager';

export default function StagerPage () {
    return <div style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
        <Leva
            collapsed
        />
        <div style={{width: '100%', height: '100%'}}>
            <LegendStagerCanvas />
        </div>
    </div>
};