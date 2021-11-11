import Styles from './disk.module.css';

export default function Disk (props : { size?: 'small' | 'large'; runes?: number; }) {
    return <div className={[Styles.root, props.size === 'large' ? Styles.large : '', Styles[`runes${props.runes || 0}`]].join(' ')}></div>
}