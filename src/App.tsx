import React from 'react';
import IndexPage from './pages/index';
import { Leva } from 'leva'

export default function App() {
    return <>
        <Leva
            collapsed
        />
        <IndexPage />
    </>
};
