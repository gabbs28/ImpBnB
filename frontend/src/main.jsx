// frontend/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import configureStore from './store';

// frontend/src/main.jsx

// ...
const store = configureStore();

if (process.env.NODE_ENV !== 'production') {
  window.store = store;
}

// ... other imports
import { restoreCSRF, csrfFetch } from './store/csrf';

// ... const store = configureStore();

if (import.meta.env.MODE !== 'production') {
  restoreCSRF();

  window.csrfFetch = csrfFetch;
  window.store = store;
}
// frontend/src/main.jsx

// ...
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
