/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 * NOTE: while this component should technically be a stateless functional
 * component (SFC), hot reloading does not currently support SFCs. If hot
 * reloading is not a necessity for you then you can refactor it and remove
 * the linting exception.
 */

import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { withRouter } from 'react-router';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {fade} from 'material-ui/utils/colorManipulator';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  grey500,
  fullWhite,
  deepOrange500,
  grey700,
  grey800,
} from 'material-ui/styles/colors';
import spacing from 'material-ui/styles/spacing';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { logOut } from './../../actions/loginActions';

import HomePage from './../HomePage';
import LoginPage from './../LoginPage';
import RegisterPage from '../RegisterPage';
import SpotRegisterPage from '../SpotRegisterPage';
// import HomePage from 'containers/HomePage/Loadable';
// import NotFoundPage from 'containers/NotFoundPage/Loadable';

const muiTheme = getMuiTheme({
  spacing,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    primary1Color: '#424242',
    primary2Color: '#1a1a1a',
    primary3Color: grey500,
    accent1Color: deepOrange500,
    accent2Color: deepOrange500,
    accent3Color: deepOrange500,
    textColor: fullWhite,
    alternateTextColor: deepOrange500,
    canvasColor: grey800,
  },
  slider: {
    trackColorSelected: grey500,
    selectionColor: deepOrange500,
  },
  stepper: {
    iconColor: deepOrange500,
    textColor: fullWhite,
    disabledTextColor: grey500,
  },
  tableRow: {
    selectedColor: deepOrange500,
  },
  appBar: {
    textColor: fullWhite,
  },
  flatButton: {
    primaryTextColor: fullWhite,
    secondaryTextColor: deepOrange500,
  },
  raisedButton: {
    primaryTextColor: fullWhite,
    disabledColor: grey700,
  },
  timePicker: {
    headerColor: deepOrange500,
    textColor: fullWhite,
  },
  textField: {
    textColor: fullWhite,
    disabledTextColor: grey500,
    hintColor: grey500,
  },
  toggle: {
    thumbOnColor: deepOrange500,
    thumbOffColor: grey500,
    //thumbDisabledColor: palette.borderColor,
    //thumbRequiredColor: palette.primary1Color,
    trackOnColor: fade(deepOrange500, 0.5),
    trackOffColor: fade(grey500, 0.5),
    //trackDisabledColor: palette.primary3Color,
    //labelColor: palette.textColor,
    //labelDisabledColor: palette.disabledColor,
    //trackRequiredColor: fade(palette.primary1Color, 0.5),
  },
  checkbox: {
    boxColor: fullWhite,
    checkedColor: fullWhite,
    //requiredColor: palette.primary1Color,
    //disabledColor: palette.disabledColor,
    //labelColor: palette.textColor,
    //labelDisabledColor: palette.disabledColor,
  },
});

class App extends Component {

  componentWillMount() {
    window.addEventListener('beforeunload', (event) => {
      this.props.dispatch(
          (dispatch, getState) => {
            const { userData } = getState();
            // if spot data is loaded, it means someone is logged in
            if (userData.spot) {
              dispatch(push('/'));
              dispatch(logOut());
              return true;
            }
          }
        );
    });
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Switch>
            <Route exact path="/" component={LoginPage} />
            <Route path="/home" component={HomePage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/spotregister" component={SpotRegisterPage} />
          </Switch>
        </div>
      </MuiThemeProvider>
    );
  }
  }

export default withRouter(connect((store) => ({
}))(App));
