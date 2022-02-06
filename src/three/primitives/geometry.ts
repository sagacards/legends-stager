import React from 'react';
import * as THREE from 'three';

// So that we can reuse one geometry instance for all cards
export function useCardGeometry() {
    const geometry = React.useRef<THREE.ShapeGeometry>(CardGeometry());
    return geometry.current;
}

export const cardThickeness = .005;

export function CardGeometry (shape: THREE.Shape = TarotCardShape()) {
    const geometry = new THREE.ExtrudeGeometry(shape, {
        bevelEnabled: false,
        depth: cardThickeness,
        steps: 1,
        UVGenerator: CardUVGenerator(shape),
    });

    // Break the geometry into front, back and side groups for texturing.
    geometry.clearGroups();
    let groupCount = [0, 0, 0];
    let groupStart: (number | undefined)[] = [undefined, undefined, undefined];
    for (let i = 1; i <= geometry.attributes.normal.count; i++) {
        const index = 2 + ((3 * i) - 3);
        const vIndex = i - 1;
        const z = geometry.attributes.normal.array[index];

        switch (z) {
            case 1: groupCount[0]++;
                groupStart[0] = groupStart[0] == null ? vIndex : groupStart[0];
                break;  // Front
            case 0: groupCount[1]++;
                groupStart[1] = groupStart[1] == null ? vIndex : groupStart[1];
                break;  // Side
            case -1: groupCount[2]++;
                groupStart[2] = groupStart[2] == null ? vIndex : groupStart[2];
                break;  // Back

        }
    }
    geometry.addGroup(groupStart[0] as number, groupCount[0], 2);
    geometry.addGroup(groupStart[1] as number, groupCount[1], 1);
    geometry.addGroup(groupStart[2] as number, groupCount[2], 0);

    return geometry;
}

export function roundedRectFromDimensions (width: number, height: number, corners: number) {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const c = corners;
    shape.lineTo(-w  , +h-c); // top left 1
    shape.bezierCurveTo(
        -w  , +h  ,  // Control point should hit the real corner
        -w+c, +h  ,  // Last two pairs are what lineTo would have been
        -w+c, +h  ,
    ); // top left 2
    shape.lineTo(+w-c, +h  ); // top right 1
    shape.bezierCurveTo(
        +w  , +h  ,
        +w  , +h-c,
        +w  , +h-c,
    ); // top right 2
    shape.lineTo(+w  , -h+c); // bottom right 1
    shape.bezierCurveTo(
        +w  , -h  ,
        +w-c, -h  ,
        +w-c, -h  ,
    ); // bottom right 2
    shape.lineTo(-w+c, -h  ); // bottom left 1
    shape.bezierCurveTo(
        -w  , -h  ,
        -w  , -h+c,
        -w  , -h+c,
    ); // bottom left 2
    shape.lineTo(-w  , +h-c); // close
    shape.autoClose = true;
    return shape;
};

export const cardDimensions = [2.75, 4.75, .125];
export const textureSize = [2750, 4750];

export function TarotCardShape () {
    return roundedRectFromDimensions(cardDimensions[0], cardDimensions[1], cardDimensions[2]);
};

export function getDimensions (shape: THREE.Shape) {
    return shape.curves.reduce((range, curve) => [
        [
            Math.min(range[0][0], curve.getPoint(0).x, curve.getPoint(0).x),
            Math.max(range[0][1], curve.getPoint(0).x, curve.getPoint(0).x)
        ],
        [
            Math.min(range[1][0], curve.getPoint(0).y, curve.getPoint(0).y),
            Math.max(range[1][1], curve.getPoint(0).y, curve.getPoint(0).y)
        ],
    ], [[0, 0], [0, 0]]).map((x) => Math.abs(x[0]) + Math.abs(x[1])) as [number, number];
};

export function CardUVGenerator (shape: THREE.Shape, offset = [0, 0, 0, 0]) {
    const [w, h] = getDimensions(shape);
    const b = [
        [-w / 2 + offset[0], -h / 2 + offset[0]],
        [+w / 2, +h / 2],
    ];
    return {
        generateTopUV: function (
            geometry: THREE.ExtrudeGeometry,
            vertices: number[],
            indexA: number,
            indexB: number,
            indexC: number
        ) {

            const ax = vertices[indexA * 3];
            const ay = vertices[indexA * 3 + 1];
            const bx = vertices[indexB * 3];
            const by = vertices[indexB * 3 + 1];
            const cx = vertices[indexC * 3];
            const cy = vertices[indexC * 3 + 1];

            return [
                new THREE.Vector2((ax - b[0][0]) / (w - (offset[0] + offset[2])), (ay - b[0][1]) / (h - (offset[1] + offset[2]))),
                new THREE.Vector2((bx - b[0][0]) / (w - (offset[0] + offset[2])), (by - b[0][1]) / (h - (offset[1] + offset[2]))),
                new THREE.Vector2((cx - b[0][0]) / (w - (offset[0] + offset[2])), (cy - b[0][1]) / (h - (offset[1] + offset[2]))),
            ];
        },

        generateSideWallUV: function (
            geometry: THREE.ExtrudeGeometry,
            vertices: number[],
            indexA: number,
            indexB: number,
            indexC: number,
            indexD: number
        ) {
            // We don't give a hoot about card edges
            return [
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 0),
                new THREE.Vector2(0, 0),
            ];
        }
    }
};
