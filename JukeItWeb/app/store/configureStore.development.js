import { createStore, applyMiddleware, compose } from 'redux';
import { fromJS } from 'immutable';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware, push } from 'react-router-redux';
import {createLogger} from 'redux-logger';
import createReducer from './../reducers';

export default function configureStore(initialState = {}, history) {
  const actionCreators = {
    push,
  };

  const logger = createLogger({
    level: 'info',
    collapsed: true
  });

  const middlewares = [
    thunk, 
    routerMiddleware(history),
    logger
  ];

  const enhancers = [
    applyMiddleware(...middlewares),
  ];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers =
  process.env.NODE_ENV !== 'production' &&
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // TODO Try to remove when `react-router-redux` is out of beta, LOCATION_CHANGE should not be fired more than once after hot reloading
      // Prevent recomputing reducers for `replaceReducer`
      shouldHotReload: false,
      actionCreators,
    })
    : compose;
  /* eslint-enable */
  
  const store = createStore(
    createReducer(),
    initialState,
    composeEnhancers(...enhancers)
  );

  // Extensions
  //store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  //store.injectedSagas = {}; // Saga registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('../reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }
  return store;
}
