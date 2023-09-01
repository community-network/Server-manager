import * as React from "react";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import "./fade.css";

import ViewHandler from "./views";

import { ModalProvider } from "./components";
import { I18nextProvider } from "react-i18next";
import i18n from "./locales/config";

export const APP_VERSION = "1.0.3";

function App() {
  return (
    <div className="App" style={{ display: "flex", flexDirection: "column" }}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <ModalProvider>
            <ViewHandler />
          </ModalProvider>
        </I18nextProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
