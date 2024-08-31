import * as React from "react";
import * as styles from "./Card.module.css";

import { ChoosePageButtons } from "./Buttons";
import {
  IDefaultInterface,
  IDefaultWithStyleInterface,
} from "./SharedInterfaces";

export function Card(props: IDefaultWithStyleInterface): React.ReactElement {
  return (
    <div className={styles.card} style={props.style}>
      {props.children}
    </div>
  );
}

export function CardRow(props: IDefaultInterface): React.ReactElement {
  return <span className={styles.CardRow}>{props.children}</span>;
}

export function PageCard(props: {
  buttons?: (
    | { name: string; callback: (args0?: string) => void }
    | { name: React.ReactElement; callback: (args0?: string) => void }
  )[];
  maxWidth?: number;
  activeButton?: number;
  style?: React.CSSProperties;
  children?: React.ReactElement | React.ReactElement[] | string;
}): React.ReactElement {
  return (
    <div>
      <ChoosePageButtons
        buttons={props.buttons}
        maxWidth={props.maxWidth}
        activeButton={props.activeButton}
      />
      <div className={styles.PageCard} style={props.style}>
        {props.children}
      </div>
    </div>
  );
}

export function Tag(props: IDefaultInterface): React.ReactElement {
  return <span className={styles.Tag}>{props.children}</span>;
}

const ModalControll = {
  isShown: false,
  children: "",
  show: () => {
    undefined;
  },
  close: () => {
    undefined;
  },
};

const ModalContext = React.createContext(ModalControll);

export const useModal = () => React.useContext(ModalContext);

function Modal(props: {
  show?: boolean;
  content?:
    | React.ReactElement
    | boolean
    | React.ReactFragment
    | React.ReactPortal;
}): React.ReactElement {
  const controller = useModal();

  return (
    <div className={props.show ? styles.modal : styles.modalDisabled}>
      <div
        className={styles.modalBackground}
        onClick={() => controller.close(null)}
      ></div>
      <div className={styles.modalContent}>{props.content}</div>
    </div>
  );
}

export function ModalProvider(props: IDefaultInterface): React.ReactElement {
  const [controllerState, setControllerState] = React.useState({
    isShown: false,
    children: "",
  });

  const showModal = (e: string) => {
    setControllerState((s) => ({
      ...s,
      isShown: true,
      children: e,
    }));
  };

  const closeModal = () => {
    setControllerState((s) => ({
      ...s,
      isShown: false,
    }));
  };

  return (
    <ModalContext.Provider
      value={{ ...controllerState, show: showModal, close: closeModal }}
    >
      <Modal
        show={controllerState.isShown}
        content={controllerState.children}
      />
      {props.children}
    </ModalContext.Provider>
  );
}
