
import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

import styles from "./Buttons.module.css";
import { Status } from "./Status";
import { useMeasure } from 'react-use';


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

export function ButtonUrl(props) {
    var style = props.style || {};
    if (props.background_color) {
        style["background"] = props.background_color
    }
    if (props.width) {
        style["width"] = props.width;
    }
    return (
        <a href={props.href} target="_blank" rel="noopener noreferrer"><button value={props.value} onClick={props.onClick} className={styles.button} disabled={props.disabled} title={props.name} style={style}>{props.name}<Status status={props.status} /></button></a>
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

    var inputField = (props.value === undefined) ? 
    (<input defaultValue={props.defaultValue} className={styles.TextInput} disabled={props.disabled} style={props.style} type={props.type || "text"} placeholder={props.name} onReset={props.callback} onChange={props.callback} />) : 
    (<input value={props.value} defaultValue={props.defaultValue} className={styles.TextInput} disabled={props.disabled} style={props.style} type={props.type || "text"} placeholder={props.name} onReset={props.callback} onChange={props.callback} />)
    
    return (
        <div className={styles.TextInputWrapper}>
            {inputField}
        </div>
    );
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
            <div className={switchClassName} onClick={switchTheSwitch} isChecked={checkedSwitch} onKeyPress={SwitchOnenter} role="switch" tabIndex="1">
                <span className={styles.SwitchInner}>
                    <span className={styles.SwitchOn}></span>
                    <span className={styles.SwitchOff}></span>
                </span>
                <span className={styles.SwitchHandle}></span>
            </div>
            <span style={{maxWidth: "300px"}}>{props.name}</span>
        </div>
    );
}

export function PlayerDropdownButton(props) {
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
            <button type="button" className={styles.PlayerButton} onClick={() => setOpen(!open)}>{props.name}</button>
            {open && (<div className={styles.dropdown}>
                <ul className={styles.ul}>
                    {
                        props.options.map(option => <li className={styles.li} onClick={() => {setOpen(!open); return option.callback()}}>{option.name}</li>)
                    }
                </ul>
            </div>)}
        </div>
    );
}


export function ChoosePageButtons(props) {

    const [active, setActive] = useState(0);
    const [pageCardRef, { width }] = useMeasure();
    let maxWidth = props.maxWidth || 1180

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
        <div className={styles.ChoosePageButtonHolder} ref={pageCardRef}>
            {width < maxWidth ? 
                <>
                    <div 
                        className={styles.ChoosePageButtonActive}
                        title={props.buttons[active].name}
                    >
                        {props.buttons[active].content || props.buttons[active].name}
                    </div>
                    <div
                        className={styles.ChoosePageButton}
                        onClick={() => setOpen(!open)}
                        ref={container}
                    >☰
                    {open && (<div className={styles.dropdown}>
                        <ul className={styles.ul}>
                            {
                                
                                props.buttons.map((button, i) => {
                                    return (
                                <li 
                                    key={i}
                                    className={styles.li}
                                    onClick={_ => { setActive(i); button.callback() }}
                                    title={button.name}
                                    tabIndex="1" 
                                >
                                    {button.name}
                                </li>)
                            })
                            }
                        </ul>
                    </div>)}
                    </div>
                    
                </>
            :
                props.buttons.map((button, i) => (
                    <div
                        key={i}
                        isChecked={i === active}
                        role="switch"
                        className={(i === active) ? styles.ChoosePageButtonActive : styles.ChoosePageButton}
                        onClick={_ => { setActive(i); button.callback() }}
                        title={button.name}
                        tabIndex="1" 
                    >
                        {button.content || button.name}
                    </div>
                ))
            }
        </div>
    );
    
}

function IconSelected(props) {
    return (
        <svg className={styles.iconSelect} viewBox="0 0 24 24">
            <path fill="currentColor" d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z" />
        </svg>
    );
} 

function IconNotSelected(props) {
    return (
        <svg className={styles.iconSelect} viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
        </svg>
    );
} 

export function SelectableRow(props) {
    const [selected, setSelcted] = React.useState(false);
    const select = (p) => {
        setSelcted(p);
        props.callback(p);
    }
    return (
        <div className={(selected) ? styles.selectableRowSelected : styles.selectableRow} onClick={() => select(!selected)}>
            {
                (selected) ? <IconSelected /> : <IconNotSelected />
            }
            {props.children}
        </div>
    );
}