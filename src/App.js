
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Switch } from 'react-router-dom';


import './App.css';
import './fade.css';

import Views from "./views";
import Main from "./views/Main";
import { Sidebar, PageContainer, PageColumn, ModalProvider, TopBar } from "./components";

export const APP_VERSION = "1.0.3";


function AnimatedApp() {
    
}

function App() {

    const [sidebarVisisble, hideSidebar] = useState(true);

    return (
        <div className="App"style={{display: "flex", flexDirection: "column"}}>
            <BrowserRouter>
                <ModalProvider>
                    <Switch>
                        <Route exact path="/" component={Main} />
                        <Route>
                            <TopBar hideSidebar={_ => hideSidebar(!sidebarVisisble) }/>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <Sidebar visible={sidebarVisisble} />
                                <Views />
                            </div>
                        </Route>
                    </Switch>
                </ModalProvider>
            </BrowserRouter>
        </div>
    );
}

export default App;

