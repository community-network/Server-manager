
import React from "react";
import { HashRouter, useLocation, Route, Switch } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

import './App.css';
import './fade.css';

import Views from "./views";
import Main from "./views/Main";
import { createHashHistory } from 'history';
import { Sidebar, PageContainer, PageColumn, ModalProvider } from "./components";


export const history = createHashHistory();

export const APP_VERSION = "1.0.3";

function App() {

    let location = useLocation();

    return (
        <div className="App">
            <HashRouter>
                <ModalProvider>
                    <Switch>
                        <Route exact path="/" component={Main} />
                        <Route>
                            
                            {/*<TopBar />*/}
                            <Sidebar />
                            <TransitionGroup component={PageContainer}>
                                <CSSTransition key={location.hash} classNames="fade" timeout={200}>
                                    <PageColumn>
                                        <Views />
                                    </PageColumn>
                                </CSSTransition>
                            </TransitionGroup>
                            
                        </Route>
                    </Switch>
                </ModalProvider>
            </HashRouter>
        </div>
    );
}

export default App;

