import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import styles from "./Buttons.module.css";


export function Button(props) {
    var style = {};
    if (props.width) {
        style["width"] = props.width;
    }
    return (
        <button className={styles.button} disabled={props.disabled} onClick={props.callback} title={props.name} style={style}>{props.name}</button>
    );
}

export function ButtonLink(props) {
    return (
        <NavLink className={styles.button} to={props.to} title={props.name}>{props.name}</NavLink>
    );
}

export function ButtonRow(props) {
    return (
        <div className={styles.buttonRow}>{props.children}</div>
    );
}


export function TextInput(props) {
/*    var callback = props.callback, elementClassName = styles.TextInput;
    if (props.disabled) {
        callback = null;
        elementClassName = styles.TextInputDis;
    }*/
    return (
        <input className={styles.TextInput} disabled={props.disabled} type="text" placeholder={props.name} onChange={props.callback} />
    );
}

export function SmallButton(props) {
    return (
        <div className={styles.SmallButton} onClick={props.callback} title={props.name}>{props.content || props.name}</div>
    );
}

export function Switch(props) {

    const [checkedSwitch, clickSwitch] = useState(props.checked || false);
    const switchClassName = checkedSwitch ? styles.Switch : styles.SwitchActive;

    const switchTheSwitch = () => {
        var newVal = !checkedSwitch;
        clickSwitch(newVal);
        if (props.callback) props.callback(newVal);
    };

    /*  If user uses tabs, make it clickable on Enter key */
    const SwitchOnenter = (e) => {
        if (e.charCode === 13) switchTheSwitch();
    };

    return (
        <div className={switchClassName} onClick={switchTheSwitch} onKeyPress={SwitchOnenter} role="switch" tabindex="1">
            <span className={styles.SwitchInner}>
                <span className={styles.SwitchOn}></span>
                <span className={styles.SwitchOff}></span>
            </span>
            <span className={styles.SwitchHandle}></span>
        </div>
    );
}