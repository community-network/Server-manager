import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import App from './App';


const queryClient = new QueryClient();

// Browser rendering

ReactDOM.render(

    <React.StrictMode> 
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>,

    document.getElementById('root')

);

