import * as React from "react";
import { endPointName } from "../api/JsonApi";
import { Row } from "../components";
import "../locales/config";
import { useParams } from "react-router-dom";

export default function WebSocketTest(): React.ReactElement {
  const params = useParams();
  const { sid } = params;
  const ws = new WebSocket(
    "wss://" + endPointName + "/ws/joins?serverid=" + sid,
  );
  ws.onmessage = function (event) {
    console.log(event.data);
  };

  return <Row></Row>;
}
