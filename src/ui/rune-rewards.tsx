import React from 'react';
import Styles from './rune-rewards.module.css';
import Disk from 'ui/disk';
import GoldText from 'ui/gold-text';

export default function RuneRewards () {
    return <div className={Styles.root}>
        <div className={Styles.rune}>
            <Disk runes={1} />
            <div className={Styles.title}><GoldText>One Rune</GoldText></div>
            <div className={Styles.text}>Make your disk everlasting. (Disks with no runes will eventually be lost.)</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={2} />
            <div className={Styles.title}><GoldText>Two Runes</GoldText></div>
            <div className={Styles.text}>Craft decks using the first forge slot of a Legend.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={3} />
            <div className={Styles.title}><GoldText>Three Runes</GoldText></div>
            <div className={Styles.text}>Early access to new Saga features and apps.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={4} />
            <div className={Styles.title}><GoldText>Four Runes</GoldText></div>
            <div className={Styles.text}>Craft decks using the second forge slot.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={5} />
            <div className={Styles.title}><GoldText>Five Runes</GoldText></div>
            <div className={Styles.text}>Unlimited daily draws.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={6} />
            <div className={Styles.title}><GoldText>Six Runes</GoldText></div>
            <div className={Styles.text}>Craft decks using the third forge slot.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={7} />
            <div className={Styles.title}><GoldText>Seven Runes</GoldText></div>
            <div className={Styles.text}>Craft decks using card back and border from different legends.</div>
        </div>
        <div className={Styles.rune}>
            <Disk runes={8} />
            <div className={Styles.title}><GoldText>Eight Runes</GoldText></div>
            <div className={Styles.text}>Craft decks using the fourth and final forge slot.</div>
        </div>
    </div>
};