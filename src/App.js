
import React from "react";
import { useLocation } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from "react-transition-group";

import './App.css';
import './fade.css';

import Views from "./views";

import { Sidebar, PageContainer, PageColumn } from "./components";


function ViewportHolder(props) {
    return (
        <div className="App">{props.children}</div>
    );
}

function App() {

    let location = useLocation();

    return (
        <div className="App">
            <Sidebar />
            <TransitionGroup component={PageContainer}>
                <CSSTransition key={location.key} classNames="fade" timeout={200}>
                    <PageColumn>
                        <Views location={location} />
                    </PageColumn>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
}

export default App;
