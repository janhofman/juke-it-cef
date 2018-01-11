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
import {withRouter} from 'react-router';

import HomePage from './../HomePage';
import LoginPage from './../LoginPage';
//import HomePage from 'containers/HomePage/Loadable';
//import NotFoundPage from 'containers/NotFoundPage/Loadable';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import {
  cyan700,
  grey500,
  pinkA100, pinkA200, pinkA400,
  fullWhite, deepOrange500, red500,
  grey800,
} from 'material-ui/styles/colors';
import spacing from 'material-ui/styles/spacing';
import {push} from 'react-router-redux';
import { connect } from 'react-redux';
import {logOut} from './../../actions/loginActions';

const muiTheme = getMuiTheme({
  spacing: spacing,
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
  appBar:{
    textColor: fullWhite,
  },
  flatButton:{
    primaryTextColor: fullWhite,
  },
  timePicker:{
    headerColor: deepOrange500,
    textColor: fullWhite
  },
  textField:{
    textColor: fullWhite,
    disabledTextColor: grey500,
    hintColor: grey500,
  }
});

class App extends Component {
  
    componentWillMount(){
      window.addEventListener('beforeunload', (event) => {
        this.props.dispatch(
          (dispatch, getState) => {
            const {userData} = getState();
            // if spot data is loaded, it means someone is logged in
            if(userData.spot){
              dispatch(push('/'));
              dispatch(logOut());
              return true;
            }
          }
        )
      });
    }
    
    render() {
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
          <div>
            <Switch>
              <Route exact path="/" component={LoginPage} />
              <Route path="/home" component={HomePage} />
            </Switch>
        </div>
        </MuiThemeProvider>
      );
    }
  }
  
  export default withRouter(connect((store) => {
      return({
      })
  })(App))
