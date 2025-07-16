import React from 'react';
import ReactDOM from 'react-dom/client';
import App from 'App.jsx'; // <-- Your UI component(s) live here

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />  {/* <-- This is where the UI “function” is called */}
  </React.StrictMode>
);
