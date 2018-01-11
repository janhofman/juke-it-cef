import { createStore, applyMiddleware } from 'redux';
import { fromJS } from 'immutable';
import thunk from 'redux-thunk';
import { hashHistory } from 'react-router';
import { routerMiddleware } from 'react-router-redux';
import createReducer from '../reducers';

const enhancer = applyMiddleware(thunk, routerMiddleware(history));

export default function configureStore(initialState = {}, history) {
  
  return  createStore(createReducer(), fromJS(initialState), enhancer); // eslint-disable-line
}
