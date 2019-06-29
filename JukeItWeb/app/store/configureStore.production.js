import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import createReducer from '../reducers';

export default function configureStore(initialState = {}, history) {  
  const enhancer = applyMiddleware(thunk, routerMiddleware(history));
  return  createStore(createReducer(), initialState, enhancer); // eslint-disable-line
}
