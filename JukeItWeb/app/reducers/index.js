/**
 * Combine all reducers in this file and export the combined reducers.
 */
import { combineReducers } from 'redux';//immutable';
import { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

//import languageProviderReducer from 'containers/LanguageProvider/reducer';
import login from './loginReducer';
import userData from './userDataReducer';
import register from './registerReducer';
import player from './playerReducer';
import library from './libraryReducer';
import playback from './playbackReducer';
import songList from './songListReducer';
import playlists from './playlistsReducer';
import devices from './devicesReducer';
import languageProviderReducer from './../containers/LanguageProvider/reducer';

/*
 * routeReducer
 *
 * The reducer merges route location changes into our immutable state.
 * The change is necessitated by moving to react-router-redux@4
 *
 */


// Initial routing state
const routeInitialState = {
  location: null,
};

/**
 * Merge route into the global application state
 */
function routeReducer(state = routeInitialState, action) {
  switch (action.type) {
    /* istanbul ignore next */
    case LOCATION_CHANGE:
      return {...state, location: action.payload};
    default:
      return state;
  }
}

/**
 * Creates the main reducer with the dynamically injected ones
 */
export default function createReducer(injectedReducers) {
  return combineReducers({
    route: routeReducer,
    language: languageProviderReducer,
    login,
    userData,
    register,
    player,
    library,
    playback,
    songList,
    playlists,
    devices,
    firebase: (state = {}) => state,
    cefQuery: (state = {}) => state,
    ...injectedReducers,
  });
}
