import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import App from './App';


const queryClient = new QueryClient();

// Browser rendering
const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use 

root.render(
    <React.StrictMode> 
        <QueryClientProvider client={queryClient}>
            <App />
        </QueryClientProvider>
    </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
