import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, IntlProvider } from 'react-intl';
import { Switch, Route, Link } from 'react-router-dom';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import { deepOrange500, grey500 } from 'material-ui/styles/colors';

import messages from './messages';
import StyledTextField from '../StyledTextField';
import { logoNegative } from '../../images';

const styles = {
  textfield: {
    width: '80%',
    margin: 'auto',
    maxWidth: '350px',
  },
  logo: {
    width: '100%',
    display: 'block',
    maxWidth: '400px',
    margin: 'auto',
  },
  underline: {
    borderColor: deepOrange500,
  },
  focus: {
    color: deepOrange500,
  },
  btnWrapper: {
    marginTop: '1em',
    marginBottom: '3em',
    textAlign: 'center',
  },
  linkWraper: {
    textAlign: 'center',
    color: deepOrange500,
    margin: '1.5em',
  },
  progress: {
    display: 'block',
    margin: '1em auto',
  },
  link: {
    color: deepOrange500,
  },
};

class Register extends Component {

  render() {
    const { invalidEmail, invalidPasswd, invalidName, working, signUp, intl } = this.props;
    const { formatMessage } = intl;
    return (
      <div>
        <img src={logoNegative} style={styles.logo} />
        <div style={styles.textfield}>
          <StyledTextField
            floatingLabelText={formatMessage(messages.emailLbl)}
            hintText={formatMessage(messages.emailHint)}
            type="email"
            id="email"
            errorText={invalidEmail ? formatMessage(messages.invalidEmail) : null}
          />
        </div>
        <div style={styles.textfield}>
          <StyledTextField
            floatingLabelText={formatMessage(messages.passwdLbl)}
            type="password"
            id="password"
            errorText={invalidPasswd ? formatMessage(messages.invalidPasswd) : null}
          />
        </div>
        <div style={styles.textfield}>
          <StyledTextField
            floatingLabelText={formatMessage(messages.nameLbl)}
            hintText={formatMessage(messages.nameHint)}
            type="text"
            id="name"
            errorText={invalidName ? formatMessage(messages.invalidName) : null}
          />
        </div>

        <div style={styles.btnWrapper}>
          <RaisedButton
            label={formatMessage(messages.signUp)}
            backgroundColor={deepOrange500}
            onTouchTap={signUp}
          />
        </div>

        <div style={styles.linkWraper} >
          <Link to={'/'} style={styles.link} >
            {formatMessage(messages.login)}
          </Link>

        </div>
        <CircularProgress
          size={40}
          color={grey500}
          style={{
            ...styles.progress,
            visibility: working ? 'visible' : 'hidden',
          }}
        />
      </div>
    );
  }
}

Register.propTypes = {
  invalidEmail: PropTypes.bool.isRequired,
  invalidPasswd: PropTypes.bool.isRequired,
  invalidName: PropTypes.bool.isRequired,
  working: PropTypes.bool.isRequired,
  signUp: PropTypes.func.isRequired,
  intl: PropTypes.shape(IntlProvider.propTypes.intl),
}

export default injectIntl(Register);
