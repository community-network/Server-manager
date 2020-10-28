import logo from './logo.svg';
import './App.css';

import TopBar from "./TopBar/TopBar.js";
import ServerPanel from "./ServerPanel/ServerPanel.js";

import { OperationsApi, ApiProvider } from "./api";

function App() {
  return (
    <div className="App">
        <TopBar />
        <OperationsApi.Provider value={new ApiProvider()}>
            <ServerPanel />
        </OperationsApi.Provider>
    </div>
  );
}

export default App;
