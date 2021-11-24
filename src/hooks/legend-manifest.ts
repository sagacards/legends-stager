import React from 'react';

type Tag = string;
type FilePath = string;
type Color = string;

export interface LegendManifest {
    back: Tag;
    border: Tag;
    ink: Tag;
    maps: {
        normal: FilePath;
        layers: [FilePath];
        back: FilePath;
        border: FilePath;
        background: FilePath;
    };
    colors: {
        base: Color;
        specular: Color;
        emissive: Color;
    };
    views: {
        flat: FilePath;
        sideBySide: FilePath;
        animated: FilePath;
        interactive: FilePath;
    }
};

// export const host = window.location.host.includes('localhost')
//     ? 'http://rwlgt-iiaaa-aaaaa-aaaaa-cai.localhost:8000'
//     : `https://${window.location.host}`;

export const host = 'https://nges7-giaaa-aaaaj-qaiya-cai.raw.ic0.app';

const promise = fetch(`${host}/legend-manifest/${(window as any).legendIndex || 0}/`).then(r => r.json());

export default suspend<LegendManifest>(promise);

function suspend<T> (promise: Promise<T>) {
    let result : T;
    let status = 'pending';

    const suspender = promise.then(response => {
        status = 'success';
        result = response;
    }, error => {
        status = 'error';
        result = error;
    });

    return function () {
        switch(status) {
            case 'pending':
                throw suspender;
            case 'error':
                throw result;
            default:
                return result;
        }
   };
}