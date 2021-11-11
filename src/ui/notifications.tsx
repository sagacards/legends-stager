import React from 'react';
import Styles from './notifications.module.css';

export default function Notifications () {
    return <div className={Styles.root}>
        <p className="text-center typescale-3">Register your email address to recieve any of the following notifications.<br />Only these emails will be sent, and you will only receive those you select.</p>
        <div className={Styles.form}>
            <div>
                <label>
                    <input type="checkbox" />
                    <div>Details on deck crafting.</div>
                </label>
                <label>
                    <input type="checkbox" />
                    <div>Details on the first release.</div>
                </label>
                <label>
                    <input type="checkbox" />
                    <div>Details on the roadmap.</div>
                </label>
            </div>
            <div>
                <label>
                    <div>Email Address</div>
                    <input type="email" />
                </label>
                <input type="submit" value="Notify Me!" />
            </div>
        </div>
    </div>
}