import React from "react";

let colors = [
    [
        'Copper',
        "#000000",
        "#4e230a",
        "#a78319",
    ],
    [
        'Silver',
        "#33343b",
        "#3f484e",
        "#a7bcc4",
    ],
    [
        'Gold',
        "#764007",
        "#873d00",
        "#c4a42f",
    ],
    [
        'Canopy',
        "#3a3e39",
        "#57b44b",
        "#424800",
    ],
    [
        'Rose',
        "#524f32",
        "#4b0000",
        "#ff00ee",
    ],
    [
        'Spice',
        "#341414",
        "#620909",
        "#b40000",
    ],
    [
        'Midnight',
        "#191224",
        "#7239aa",
        "#00536c",
    ],
    [
        'new #1',
        '#140c0c',
        '#3b3636',
        '#000',
    ],
    [
        'new #2',
        '#07070d',
        '#222341',
        '#656565',
    ],
    [
        'new #3',
        '#0d0d21',
        '#646580',
        '#2a4d79',
    ],
]; 

if (window.localStorage.getItem('colors')) {
    colors = JSON.parse(window.localStorage.getItem('colors') as string);
}

export default colors;