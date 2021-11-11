import React from 'react';
import LegendPreviewCanvas from 'three/legend-preview';
import Background from 'ui/background';

export default function IndexPage () {
    return <div style={{width: '100vw', height: '100vh', overflow: 'hidden'}}>
            <div style={{width: '100%', height: '100%'}}>
                <LegendPreviewCanvas />
            </div>
    </div>
};