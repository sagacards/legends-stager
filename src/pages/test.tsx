import React from 'react';

export default function TestPage () {
    const [images, setImages] = React.useState<React.ReactNode[]>([]);
    
    async function test (i = 0) {
        const manifest = await (await fetch(`http://rwlgt-iiaaa-aaaaa-aaaaa-cai.localhost:8000/legend-manifest/${i}`)).json();
        return <>
            <h1>{manifest.back} {manifest.border} {manifest.ink}</h1>
            <img src={`https://nges7-giaaa-aaaaj-qaiya-cai.raw.ic0.app/side-by-side-preview/${i}`} />
            <br />
            <hr />
        </>;
    }

    React.useEffect(() => {
        const promises = [];
        for (let i = 0; i < 117; i++) {
            promises.push(test(i));
        };
        Promise.all(promises).then(r => {
            console.log(r);
            setImages(r);
        })
    }, []);

    return <div className="f f-gap-4 text-center">
        <h1>Let's make sure all of the NFTs have a preview image.</h1>
        <hr />
        {images}
    </div>
};