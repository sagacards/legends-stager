import React from 'react';
import Styles from './team.module.css';

export default function Team (props : { members : {name : string; title : string; bio : React.ReactNode; photo : string;}[] }) {
    return <div className={Styles.root}>
        {props.members.map((m, i) => <div className={Styles.member} key={`team${i}`}>
            <img className={Styles.photo} src={m.photo} />
            <div className={Styles.name}>{m.name}</div>
            <div className={Styles.title}>{m.title}</div>
            <div className={Styles.bio}>{m.bio}</div>
        </div>)}
    </div>
};