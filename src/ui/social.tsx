import React from 'react';
import { AiOutlineInstagram, AiOutlineTwitter } from 'react-icons/ai';
import Styles from './social.module.css';

export default function Social () {
    return <div className={Styles.root}>
        <a className={Styles.link} href="https://twitter.com/sagacards">
            <AiOutlineTwitter size={'24px'} />
            sagacards
        </a>
        <a className={Styles.link} href="https://instagram.com/sagacards">
            <AiOutlineInstagram size={'24px'} />
            sagacards
        </a>
    </div>
};