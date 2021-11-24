import React from 'react';
import Styles from './styles.module.css';

interface Props {
    time: 'dawn' | 'day' | 'dusk'| 'night';
    fade?: boolean;
    children?: React.ReactNode;
};

export default function Background ({
    time,
    fade,
    ...props
} : Props) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (loaded) return;
        if (!ref.current) return
        const href = getComputedStyle(ref.current).background.match(/url\(["']?([^'"]+)["']?\)/);
        if (!href) return;
        const image = href[1];
        const imageLoader = new Image();
        imageLoader.onload = () => {
            setLoaded(true);
        };
        imageLoader.src = image;
    }, [ref]);

    return <div className={[Styles.root, Styles[time], loaded ? Styles['loaded'] : ''].join(' ')}>
        <div className={Styles.backdrop} ref={ref} />
        {fade && <div className={Styles.fade} />}
        <div className={Styles.foreground}>
            {props.children}
        </div>
    </div>
};