import Styles from './logo.module.css';

export default function Logo () {
    return <div className={Styles.root}>
        <div className={Styles.word}>Saga</div>
        <div className={Styles.logo}></div>
        <div className={Styles.word}>Tarot</div>
    </div>
}