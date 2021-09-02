import React from "react";
import { endPointName } from "../JsonApi";
import { Row } from "../components";
import '../locales/config';
import { useTranslation } from 'react-i18next';

export function WebSocketTest(props) {
    let { sid } = props.match.params;
    const { t } = useTranslation();
    var ws = new WebSocket('wss://' + endPointName + '/ws/joins?serverid=' + sid);
    ws.onmessage = function (event) {
        console.log(event.data);
    };

    return (
        <Row>
        </Row>
    );

}