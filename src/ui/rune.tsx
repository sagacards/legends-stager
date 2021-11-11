import React from 'react';
import Styles from './rune.module.css';

export default function Rune ({ children }: { children?: React.ReactNode }) {
    return <div className={Styles.root}>
        {children}
    </div>
}