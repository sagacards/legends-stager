import React from 'react';
import create from "zustand";
import { useControls } from 'leva';

type Time = 0 | 1 | 2 | 3; // dawn, day, dusk, night

interface Store {
    time: number;
}


////////////////////////////
// The Application Store //
//////////////////////////


export default function useStore() {

    // Set time to now, add control to admin UI

    const store = create<Store>((set, get) => ({
        time: 3,
    }));
    return store();
}
