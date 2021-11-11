import React from 'react';
import Styles from './runestrip.module.css';
import { runes } from './runetable';

export default function RuneStrip () {
    return <div className={Styles.root}>
    {runes.map((r, i) => <div key={`runestrip${i}`}>
        {r.rune}
    </div>)}
</div>
}