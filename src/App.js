
import React, { useState } from "react";
import { HashRouter, useLocation, Route, Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

import './App.css';
import './fade.css';

import Views from "./views";
import Main from "./views/Main";
import { createHashHistory } from 'history';
import { Sidebar, PageContainer, PageColumn, ModalProvider, TopBar } from "./components";


export const history = createHashHistory();

export const APP_VERSION = "1.0.3";

function App() {

    let location = useLocation();

    const [sidebarVisisble, hideSidebar] = useState(true);

    return (
        <div className="App"style={{display: "flex", flexDirection: "column"}}>
            <HashRouter>
                <ModalProvider>
                    <Switch>
                        <Route exact path="/" component={Main} />
                        <Route>
                            <TopBar hideSidebar={_ => hideSidebar(!sidebarVisisble) }/>
                            <div style={{display: "flex", flexDirection: "row"}}>
                                <Sidebar visible={sidebarVisisble} />
                                <TransitionGroup component={PageContainer}>
                                    <CSSTransition key={location.hash} classNames="fade" timeout={200}>
                                        <PageColumn>
                                            <Views />
                                        </PageColumn>
                                    </CSSTransition>
                                </TransitionGroup>
                            </div>
                        </Route>
                    </Switch>
                </ModalProvider>
            </HashRouter>
        </div>
    );
}

export default App;

