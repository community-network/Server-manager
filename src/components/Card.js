import React from "react";
import styles from "./Card.module.css";

import { ChoosePageButtons } from "./Buttons.js";

export function Card(props) {
    return (
        <div className={styles.card} style={props.style}>
            {props.children}
        </div>
    );
}

export function CardRow(props) {
    return <span className={styles.CardRow}>{props.children}</span>;
}

export function PageCard(props) {
    return (
        <>
            <ChoosePageButtons buttons={props.buttons} />
            <div className={styles.PageCard} style={props.style}>
                {props.children}
             </div>
        </>
    );
}

export function Tag(props) {
    return (
        <span className={styles.Tag}>
            {props.children}
        </span>
    );
}



const ModalControll = {
    isShown: false,
    children: "",
    show: (e) => {},
    close: (e) => {},
}

const ModalContext = React.createContext(ModalControll);

export const useModal = () => React.useContext(ModalContext);

function Modal(props) {

    const controller = useModal();

    return (
        <div className={props.show ? styles.modal : styles.modalDisabled}>
            <div className={styles.modalBackground} onClick={() => controller.close()}></div>
            <div className={styles.modalContent}>{props.content}</div>
        </div>
    );
}

export function ModalProvider(props) {

    const [controllerState, setControllerState] = React.useState({
        isShown: false,
        children: "",
    });

    const showModal = (e) => {
        setControllerState(s => ({
            ...s,
            isShown: true,
            children: e,
        }));
    }

    const closeModal = () => {
        setControllerState(s => ({
            ...s,
            isShown: false,
        }));
    }

    return (
        <ModalContext.Provider value={{...controllerState, show: showModal, close: closeModal}}>
            <Modal show={controllerState.isShown} content={controllerState.children} />
            {props.children}
        </ModalContext.Provider>
    );
}