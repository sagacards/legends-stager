import React from 'react';
import Styles from './checklist.module.css';

export default function CheckList (props : { children: React.ReactNode[] }) {
    return <div className={Styles.root}>
        {props.children.map((n, i) => <div className={Styles.node} key={`checklist${i}`}>
            <div className={Styles.check} />
            {n}
        </div>)}
    </div>
};