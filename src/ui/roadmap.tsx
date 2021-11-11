import React from 'react';
import Styles from './roadmap.module.css';
import GoldText from 'ui/gold-text';

export default function Roadmap () {
    return <div className={Styles.root}>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Stoic and Plug Wallet Integration</GoldText></div>
            <div className={Styles.detail}>Legends and Disks will be compatible with Plug and Stoic.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>CAP and DAB Integration</GoldText></div>
            <div className={Styles.detail}>CAP and DAB are standards that add valuable/critical functionality to NFTs, developed by the Psychadelic DAO. This will give Legend and Disk NFTs transaction history, and will allow them to be automatically discovered by dApps.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Disk of Legends Release</GoldText></div>
            <div className={Styles.detail}>An NFT that is progressively empowered by minting legends.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>First Legend Release</GoldText></div>
            <div className={Styles.detail}>The fool.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Marketplace Integration</GoldText></div>
            <div className={Styles.detail}>Entrepot integration.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Biweekly Legend Releases Begin</GoldText></div>
            <div className={Styles.detail}>One new legend will be released every two weeks until all 21 Major Arcana have been released.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Roadmap Voting</GoldText></div>
            <div className={Styles.detail}>NFT holders will be able to vote on a Roadmap matter based on the number of NFTs that they hold.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Earth Wallet Integration</GoldText></div>
            <div className={Styles.detail}>Earth Wallet now supports NFTs. We can integrate with this project, and any other wallets the community decides to support.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Deck Forging</GoldText></div>
            <div className={Styles.detail}>More details soon.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Final Legend Release</GoldText></div>
            <div className={Styles.detail}>Summer 2022.</div>
        </div>
        <div className={Styles.item}>
            <div className={Styles.title}><GoldText>Governance</GoldText></div>
            <div className={Styles.detail}>More details later.</div>
        </div>
    </div>
}