import * as React from "react";
import { NavLink, To } from "react-router-dom";

import { useMeasure } from "react-use";
import * as styles from "./Buttons.module.css";
import { Status } from "./Status";

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { OperationsApi } from "../api/api";
import { IReasonList } from "../api/ReturnTypes";

export function Button(props: {
  style?: React.CSSProperties;
  background_color?: string;
  width?: number;
  value?: string;
  disabled?: boolean;
  callback?: { (): void };
  name?: string;
  content?: React.ReactElement | React.ReactElement[] | string;
  status?: string;
}): React.ReactElement {
  const style = props.style || {};
  if (props.background_color) {
    style["background"] = props.background_color;
  }
  if (props.width) {
    style["width"] = props.width;
  }
  return (
    <button
      value={props.value}
      className={styles.button}
      disabled={props.disabled}
      onClick={props.callback}
      title={props.name}
      style={style}
    >
      {props.content || props.name}
      <Status status={props.status} />
    </button>
  );
}

export function ButtonUrl(props: {
  style?: React.CSSProperties;
  background_color?: string;
  width?: number;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  disabled?: boolean;
  name?: string;
  status?: string;
}): React.ReactElement {
  const style = props.style || {};
  if (props.background_color) {
    style["background"] = props.background_color;
  }
  if (props.width) {
    style["width"] = props.width;
  }
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={props.onClick}
      className={styles.button}
      disabled={props.disabled}
      title={props.name}
      style={style}
    >
      {props.name}
      <Status status={props.status} />{" "}
    </a>
  );
}
export function ButtonLink(props: {
  disabled?: boolean;
  name?: string;
  style?: React.CSSProperties;
  to?: To;
}): React.ReactElement {
  if (props.disabled) {
    return <Button name={props.name} disabled={true} />;
  }
  return (
    <NavLink
      style={props.style}
      className={styles.button}
      to={props.to}
      title={props.name}
    >
      {props.name}
    </NavLink>
  );
}

export function ButtonRow(props: {
  children?:
    | React.ReactElement
    | boolean
    | React.ReactFragment
    | React.ReactPortal;
  style?: React.CSSProperties;
}): React.ReactElement {
  return <div className={styles.buttonRow}>{props.children}</div>;
}

export function TextInput(props: {
  id?: string;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];
  disabled?: boolean;
  style?: React.CSSProperties;
  type?: string;
  name?: string;
  callback?: (arg0?: any) => void;
  autocomplete?: string;
}): React.ReactElement {
  const inputField =
    props.value === undefined ? (
      <input
        defaultValue={props.defaultValue}
        className={styles.TextInput}
        disabled={props.disabled}
        style={props.style}
        type={props.type || "text"}
        placeholder={props.name}
        onReset={props.callback}
        onChange={props.callback}
      />
    ) : (
      <input
        value={props.value}
        defaultValue={props.defaultValue}
        className={styles.TextInput}
        disabled={props.disabled}
        style={props.style}
        type={props.type || "text"}
        placeholder={props.name}
        onReset={props.callback}
        onChange={props.callback}
      />
    );

  return <div className={styles.TextInputWrapper}>{inputField}</div>;
}

export function SmallButton(props: {
  disabled?: boolean;
  id?: number;
  callback: (arg0?: void) => void;
  vars?: any;
  name?: string;
  content?: React.ReactElement | React.ReactElement[] | string;
}): React.ReactElement {
  if (props.disabled) {
    return <></>;
  }
  return (
    <div
      className={styles.SmallButton}
      data-id={props.id}
      onClick={() => props.callback(props.vars)}
      title={props.name}
    >
      {props.content || props.name}
    </div>
  );
}

export function Switch(props: {
  callback?: (arg0: boolean) => void;
  checked?: boolean;
  name?: string;
  value?: boolean;
}): React.ReactElement {
  const [checkedSwitch, clickSwitch] = React.useState(false);

  const switchTheSwitch = () => {
    const newVal = !checkedSwitch;
    clickSwitch(newVal);
    if (props.callback) props.callback(newVal);
  };

  React.useEffect(() => {
    if (props.checked !== null) {
      clickSwitch(props.checked);
    }
  }, [props.checked]);

  /*  If user uses tabs, make it clickable on Enter key */
  const SwitchOnenter = (e: { charCode: number }) => {
    if (e.charCode === 13) switchTheSwitch();
  };

  const switchClassName = checkedSwitch ? styles.SwitchActive : styles.Switch;

  return (
    <div className={styles.SwitchRow}>
      <div
        className={switchClassName}
        onClick={switchTheSwitch}
        checked={checkedSwitch}
        onKeyPress={SwitchOnenter}
        role="switch"
        tabIndex={1}
      >
        <span className={styles.SwitchInner}>
          <span className={styles.SwitchOn}></span>
          <span className={styles.SwitchOff}></span>
        </span>
        <span className={styles.SwitchHandle}></span>
      </div>
      <span style={{ maxWidth: "300px" }}>{props.name}</span>
    </div>
  );
}

export function PlayerDropdownButton(props: {
  name?: string;
  options?: { callback: (arg0?: string) => void; name: string }[];
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const container: React.MutableRefObject<HTMLDivElement> = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className={styles.container} ref={container}>
      <button
        type="button"
        className={styles.PlayerButton}
        onClick={() => setOpen(!open)}
      >
        {props.name}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <ul className={styles.ul}>
            {props.options.map(
              (
                option: { callback: () => void; name: string },
                index: number,
              ) => (
                <li
                  key={index}
                  className={styles.li}
                  onClick={() => {
                    setOpen(!open);
                    return option.callback();
                  }}
                >
                  {option.name}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ShowDropDown(props: {
  options: { callback: (arg0?: string) => void; name: string }[];
}): React.ReactElement {
  const [open, setOpen] = React.useState(true);
  const container: React.MutableRefObject<HTMLDivElement> = React.useRef();
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target)) {
        setOpen(false);
      }
      if (container.current.nextSibling.contains(event.target)) {
        setOpen(true);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className={styles.container} ref={container}>
      {open && (
        <div style={{ left: 0 }} className={styles.dropdown}>
          <ul className={styles.ul}>
            {props.options.map(
              (
                option: { callback: (arg0?: string) => void; name: string },
                index: number,
              ) => (
                <li
                  key={index}
                  style={{ fontSize: "13px", fontWeight: 500 }}
                  className={styles.li}
                  onClick={() => {
                    setOpen(!open);
                    return option.callback(option.name);
                  }}
                >
                  {option.name}
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ChoosePageButtons(props: {
  activeButton: number;
  maxWidth: number;
  buttons: {
    name: string | React.ReactElement;
    callback: (arg0?: string) => void;
    content?: React.ReactElement;
  }[];
}): React.ReactElement {
  const [active, setActive] = React.useState(props.activeButton || 0);
  const [pageCardRef, { width }] = useMeasure();
  const maxWidth = props.maxWidth || 1320;

  const [open, setOpen] = React.useState(false);
  const container: React.MutableRefObject<HTMLDivElement> = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className={styles.ChoosePageButtonHolder} ref={pageCardRef}>
      {width < maxWidth && props.buttons.length !== 1 ? (
        <>
          <div
            className={styles.ChoosePageButtonActive}
            title={props.buttons[active].name.toString()}
          >
            {props.buttons[active].content || props.buttons[active].name}
          </div>
          <div
            className={styles.ChoosePageButton}
            onClick={() => setOpen(!open)}
            ref={container}
          >
            ☰
            {open && (
              <div className={styles.dropdown}>
                <ul className={styles.ul}>
                  {props.buttons.map(
                    (
                      button: {
                        callback: () => void;
                        name: string;
                      },
                      i: number,
                    ) => {
                      return (
                        <li
                          key={i}
                          className={styles.li}
                          onClick={() => {
                            setActive(i);
                            button.callback();
                          }}
                          title={button.name}
                          tabIndex={1}
                        >
                          {button.name}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        props.buttons.map(
          (
            button: {
              callback: () => void;
              name: string;
              content: React.ReactElement;
            },
            i: number,
          ) => (
            <div
              key={i}
              checked={i === active}
              role="switch"
              className={
                i === active
                  ? styles.ChoosePageButtonActive
                  : styles.ChoosePageButton
              }
              onClick={() => {
                setActive(i);
                button.callback();
              }}
              title={button.name}
              tabIndex={1}
            >
              {button.content || button.name}
            </div>
          ),
        )
      )}
    </div>
  );
}

export function IconSelected(): React.ReactElement {
  return (
    <svg className={styles.iconSelect} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"
      />
    </svg>
  );
}

export function IconNotSelected(props: {
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <svg className={styles.iconSelect} style={props.style} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"
      />
    </svg>
  );
}

export function SelectableRow(props: {
  callback: (arg0?: any) => void;
  children: React.ReactElement[] | React.ReactElement;
}): React.ReactElement {
  const [selected, setSelcted] = React.useState(false);
  const select = (p: boolean | ((prevState: boolean) => boolean)) => {
    setSelcted(p);
    props.callback(p);
  };
  return (
    <div
      className={selected ? styles.selectableRowSelected : styles.selectableRow}
      onClick={() => select(!selected)}
    >
      {selected ? <IconSelected /> : <IconNotSelected />}
      {props.children}
    </div>
  );
}

export function ReasonDropdownButton(props: {
  gid?: string;
  sid?: string;
  name: string;
  callback: (arg0?: string) => void;
  style: React.CSSProperties;
}): React.ReactElement {
  const [open, setOpen] = React.useState(false);
  const {
    data: reasonList,
  }: UseQueryResult<IReasonList, { code: number; message: string }> = useQuery({
    queryKey: ["globalReasonList" + props.gid + props.sid],
    queryFn: () =>
      OperationsApi.getReasonList({ gid: props.gid, sid: props.sid }),
  });
  const options = [];
  if (reasonList) {
    reasonList.data.forEach((element: { item: string }) => {
      options.push(element.item);
    });
  }
  const container: React.MutableRefObject<HTMLDivElement> = React.useRef();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return function cleanup() {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <div className={styles.container} ref={container}>
      <button
        disabled={options.length <= 0}
        type="button"
        className={styles.button}
        onClick={() => setOpen(!open)}
      >
        {props.name}
      </button>
      {open && (
        <div className={styles.buttonDropdown}>
          <ul className={styles.ul}>
            {options.map((option: string, index: number) => (
              <li
                key={index}
                className={styles.li}
                onClick={() => {
                  setOpen(!open);
                  return props.callback(option);
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
