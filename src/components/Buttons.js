import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import styles from "./Buttons.module.css";


export function Button(props) {
    var style = {};
    if (props.background_color) {
        style["background"] = props.background_color
    }
    if (props.width) {
        style["width"] = props.width;
    }
    return (
        <button value={props.value} className={styles.button} disabled={props.disabled} onClick={props.callback} title={props.name} style={style}>{props.name}</button>
    );
}

export function ButtonLink(props) {
    if (props.disabled) {
        return <Button name={props.name} disabled={true} />
    }
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
        <input defaultValue={props.defaultValue} className={styles.TextInput} disabled={props.disabled} style={props.style} type={props.type || "text"} placeholder={props.name} onChange={props.callback} />
    );
}

export function SmallButton(props) {
    return (
        <div className={styles.SmallButton} onClick={_ => props.callback(props.vars)} title={props.name}>{props.content || props.name}</div>
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

export function DropdownButton(props) {
    const [open, setOpen] = useState(false);

    let container = React.useRef();

    useEffect(() => {
        let handleClickOutside = (event) => {
            if (container.current && !container.current.contains(event.target)) {
                setOpen(false)
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return function cleanup() {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    })

    return (
        <div className={styles.container} ref={container}>
            <button type="button" className={styles.button} onClick={() => setOpen(!open)}>{props.name}</button>
            {open && (<div className={styles.dropdown}>
                <ul className={styles.ul}>
                    {
                        props.options.map(option => <li className={styles.li} onClick={option.callback}>{option.name}</li>)
                    }
                </ul>
            </div>)}
        </div>
    );
}
