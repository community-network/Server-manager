import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';

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

