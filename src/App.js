import './App.css';

import TopBar from "./TopBar/TopBar.js";
import ServerPanel from "./ServerPanel/ServerPanel.js";
import LogPanel from "./LogPanel";

import { OperationsApi, ApiProvider } from "./api";
import { BrowserRouter, Route } from 'react-router-dom'

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <OperationsApi.Provider value={new ApiProvider()}>
                    <TopBar />
                    <Route path="/" exact />
                    <Route path="/s1/">
                        <ServerPanel server="1" />
                    </Route>
                    <Route path="/s2/">
                        <ServerPanel server="2" />
                     </Route>
                    <Route path="/logs/">
                        <LogPanel />
                    </Route>
                </OperationsApi.Provider>
            </BrowserRouter>
        </div>
    );
}

export default App;
