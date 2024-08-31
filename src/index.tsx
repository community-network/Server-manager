import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const queryClient = new QueryClient();

ReactGA.initialize("G-X9P03CRZ8S");
// Browser rendering
const container = document.getElementById("root");
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = createRoot(container); // createRoot(container!) if you use

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

const SendAnalytics = () => {
  ReactGA.send({
    hitType: "pageview",
    page: window.location.pathname,
  });
};

reportWebVitals(SendAnalytics);
