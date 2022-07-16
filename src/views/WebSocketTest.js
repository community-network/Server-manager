import React from "react";
import { endPointName } from "../JsonApi";
import { Row } from "../components";
import '../locales/config';
import { useParams } from 'react-router-dom';

export function WebSocketTest(props) {
    let params = useParams();
    let { sid } = params;
    var ws = new WebSocket('wss://' + endPointName + '/ws/joins?serverid=' + sid);
    ws.onmessage = function (event) {
        console.log(event.data);
    };

    return (
        <Row>
        </Row>
    );

}