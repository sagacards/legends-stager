import React from 'react';
import Styles from './styles.module.css';

interface Props {
    children?: React.ReactNode;
    bright?: boolean;
}

export default function GoldText ({
    children,
    bright
} : Props) {
    return <div className={Styles.root}>
        <div className={[Styles.fore, bright ? Styles['bright'] : ''].join(' ')}>
            {children}
        </div>
        <div className={Styles.back} aria-hidden="true">{children}</div>
    </div>
}