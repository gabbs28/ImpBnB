// frontend/src/store/store.js

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

// frontend/src/store/store.js

// ...
const rootReducer = combineReducers({

});

// frontend/src/store/store.js

// ...
let enhancer;
if (import.meta.env.MODE === 'production') {
  enhancer = applyMiddleware(thunk);
} else {
  const logger = (await import("redux-logger")).default;
  const composeEnhancers =
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  enhancer = composeEnhancers(applyMiddleware(thunk, logger));
}

// frontend/src/store/store.js

// ...
const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

// frontend/src/store/store.js

// ...
export default configureStore;