
import React from "react";
import { HashRouter, useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

import './App.css';
import './fade.css';

import Views from "./views";
import { createHashHistory } from 'history';

import { Sidebar, PageContainer, PageColumn } from "./components";

export const history = createHashHistory();

function ViewportHolder(props) {
    return (
        <div className="App">{props.children}</div>
    );
}   

function App() {

    let location = useLocation();

    return (
        <div className="App">
            <HashRouter>
                <Sidebar />
                <TransitionGroup component={PageContainer}>
                    <CSSTransition key={location.key} classNames="fade" timeout={200}>
                        <PageColumn>
                            <Views />
                        </PageColumn>
                    </CSSTransition>
                </TransitionGroup>
            </HashRouter>
        </div>
    );
}

export default App;
