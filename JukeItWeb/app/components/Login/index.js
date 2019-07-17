import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import StyledTextField from './../StyledTextField';
import RaisedButton from 'material-ui/RaisedButton';
import { Link } from 'react-router-dom';
import CircularProgress from 'material-ui/CircularProgress';
import { deepOrange500, grey500 } from 'material-ui/styles/colors'; 
import messages from './messages';

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
    underline:{
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
        margin: '1.5em',
    },
    progress: {
        display: 'block',
        margin: '1em auto',
    },
    link: {        
        color: deepOrange500,
    }
}

class Login extends Component{    

    render(){
        const { 
            authorizing, 
            emptyEmail, 
            emptyPasswd,
            logIn,
            errorCode,
            intl: {
                formatMessage,
            }
        } = this.props;
        const onTextKeyUp = (e) => {
            // Number 13 is the "Enter" key on the keyboard
            if (e.keyCode === 13) {
                e.preventDefault();
                logIn();
            }
        };

        let emailError = null;
        if(emptyEmail) {
            emailError = formatMessage(messages.emptyEmail);
        }
        else if(errorCode) {
            switch(errorCode) {
                case 'auth/invalid-email':
                    emailError = formatMessage(messages.errorInvalidEmail);
                    break;
                case 'auth/user-not-found':
                    emailError = formatMessage(messages.errorUserNotFound);
                    break;
                case 'auth/wrong-password':
                    emailError = formatMessage(messages.errorWrongPassword);
                    break;
                case 'registerCompleted':
                    emailError = formatMessage(messages.errorRegisterCompleted);
                    break;
                default: 
                    emailError = formatMessage(messages.errorGeneric);
                    break;
            }
        }

        return (
            <div>
                <img src={require('./../../images/logo_negative_no_bg.png')} style={styles.logo} />
                <div style={styles.textfield}>
                    <StyledTextField
                        floatingLabelText={formatMessage(messages.emailLbl)}
                        hintText={formatMessage(messages.emailHint)}
                        type='email'
                        id='email'
                        errorText={emailError}                        
                        onKeyUp={onTextKeyUp}
                    />
                </div>
                <div style={styles.textfield}>
                    <StyledTextField
                        floatingLabelText={formatMessage(messages.passwdLbl)}
                        type='password'
                        id='password'
                        errorText={emptyPasswd ? formatMessage(messages.emptyPasswd) : null}
                        onKeyUp={onTextKeyUp}
                    />
                </div>
                <div style={styles.btnWrapper}>
                    <RaisedButton
                        label={formatMessage(messages.signIn)}
                        backgroundColor={deepOrange500}
                        onTouchTap={logIn}
                    />
                </div>
                {/*
                <div style={styles.linkWraper}>
                    <Link to={'/forgotPasswd'} style= { styles.link }>
                        {formatMessage(messages.forgotPasswd)}
                    </Link>
                </div>
                */}
                <div style={styles.linkWraper} >
                    <Link to={ '/register' } style= { styles.link }>
                        {formatMessage(messages.noAccount)}
                    </Link>
                </div>
                <CircularProgress
                    size={40}
                    color={grey500}
                    style={{
                        ...styles.progress, 
                        visibility: authorizing ? 'visible' : 'hidden'
                    }}
                />
            </div>
        )
    }
}

export default injectIntl(Login);