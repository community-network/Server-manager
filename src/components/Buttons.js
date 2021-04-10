import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import styles from "./Buttons.module.css";
import { Status } from "./Status";


export function Button(props) {
    var style = props.style || {};
    if (props.background_color) {
        style["background"] = props.background_color
    }
    if (props.width) {
        style["width"] = props.width;
    }
    return (
        <button value={props.value} className={styles.button} disabled={props.disabled} onClick={props.callback} title={props.name} style={style}>{props.name}<Status status={props.status} /></button>
    );
}

export function ButtonLink(props) {
    if (props.disabled) {
        return <Button name={props.name} disabled={true} />
    }
    return (
        <NavLink style={props.style} className={styles.button} to={props.to} title={props.name}>{props.name}</NavLink>
    );
}

export function ButtonRow(props) {
    return (
        <div className={styles.buttonRow}>{props.children}</div>
    );
}


export function TextInput(props) {
    if (props.value === undefined) {
        return <input defaultValue={props.defaultValue} className={styles.TextInput} disabled={props.disabled} style={props.style} type={props.type || "text"} placeholder={props.name} onReset={props.callback} onChange={props.callback} />;
    }
    return <input value={props.value} defaultValue={props.defaultValue} className={styles.TextInput} disabled={props.disabled} style={props.style} type={props.type || "text"} placeholder={props.name} onReset={props.callback} onChange={props.callback} />;
}

export function SmallButton(props) {
    if (props.disabled) {
        return (
            ""
        );
    }
    return (
        <div className={styles.SmallButton} onClick={_ => props.callback(props.vars)} title={props.name}>{props.content || props.name}</div>
    );
}

export function Switch(props) {

    const [checkedSwitch, clickSwitch] = useState(false);

    const switchTheSwitch = () => {
        var newVal = !checkedSwitch;
        clickSwitch(newVal);
        if (props.callback) props.callback(newVal);
    };

    useEffect(() => {
        if (props.checked !== null) {
            clickSwitch(props.checked);
        }
    }, [props.checked])

    /*  If user uses tabs, make it clickable on Enter key */
    const SwitchOnenter = (e) => {
        if (e.charCode === 13) switchTheSwitch();
    };

    const switchClassName = checkedSwitch ? styles.SwitchActive : styles.Switch;

    return (
        <div className={styles.SwitchRow}>
            <div className={switchClassName} onClick={switchTheSwitch} onKeyPress={SwitchOnenter} role="switch" tabIndex="1">
                <span className={styles.SwitchInner}>
                    <span className={styles.SwitchOn}></span>
                    <span className={styles.SwitchOff}></span>
                </span>
                <span className={styles.SwitchHandle}></span>
            </div>
            <span>{props.name}</span>
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


export function ChoosePageButtons(props) {

    const [active, setActive] = useState(0);

    return (
        <div className={styles.ChoosePageButtonHolder} >
            {
                props.buttons.map((button, i) => (
                    <div
                        key={i}
                        className={(i === active) ? styles.ChoosePageButtonActive : styles.ChoosePageButton}
                        onClick={_ => { setActive(i); button.callback() }}
                        title={button.name}
                    >
                        {button.content || button.name}
                    </div>
                ))
            }
        </div>
    );
    
}