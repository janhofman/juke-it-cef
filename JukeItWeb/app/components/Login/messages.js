import { defineMessages } from 'react-intl';

export default defineMessages({
  emailHint: {
      id: 'Login.emailHint',
      defaultMessage: "your.email@example.com",
  },
  emailLbl: {
      id: 'Login.emailLbl',
      defaultMessage: "E-mail",
  },
  passwdLbl:{
      id: 'Login.passwdLbl',
      defaultMessage: 'Password',
  },
  signIn:{
      id: 'Login.signIn',
      defaultMessage: 'sign in',
  },
  forgotPasswd: {
      id: 'Login.forgotPasswd',
      defaultMessage: 'Forgot password?',
  },
  noAccount: {
      id: 'Login.noAccount',
      defaultMessage: 'No account yet? Sign up here',
  },
  emptyEmail: {
      id: 'Login.emptyEmail',
      defaultMessage: 'Enter your e-mail',
  },
  emptyPasswd: {
      id: 'Login.emptyPasswd',
      defaultMessage: 'Enter your password',
  },
  errorInvalidEmail: {
    id: 'Login.errorInvalidEmail',
    defaultMessage: 'The email address is badly formatted',
  },
  errorUserNotFound: {
    id: 'Login.errorInvalidEmail',
    defaultMessage: 'Invalid username or password',
  },  
  errorGeneric: {
    id: 'Login.errorGeneric',
    defaultMessage: 'Log in failed',
  },
  errorWrongPassword: {
    id: 'Login.errorWrongPassword',
    defaultMessage: 'Invalid username or password',
  }, 
  errorRegisterCompleted: {
    id: 'Login.errorRegisterCompleted',
    defaultMessage: 'Your registration was successful. Please log in with your e-mail and password.',
  }
});
