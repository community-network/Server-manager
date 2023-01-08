import * as React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import "./fade.css";

import ViewHandler from "./views";

import { ModalProvider } from "./components";

export const APP_VERSION = "1.0.3";

function App() {
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <BrowserRouter>
        <ModalProvider>
          <ViewHandler />
        </ModalProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
