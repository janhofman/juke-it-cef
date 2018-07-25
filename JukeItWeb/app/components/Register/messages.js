import { defineMessages } from 'react-intl';

export default defineMessages({
  emailHint: {
    id: 'Register.emailHint',
    defaultMessage: 'your.email@example.com',
  },
  emailLbl: {
    id: 'Register.emailLbl',
    defaultMessage: 'E-mail',
  },
  passwdLbl: {
    id: 'Register.passwdLbl',
    defaultMessage: 'Password',
  },
  signUp: {
    id: 'Register.signUp',
    defaultMessage: 'sign up',
  },
  login: {
    id: 'Register.login',
    defaultMessage: 'Already have an account? Sign in here',
  },
  nameLbl: {
    id: 'Register.nameLbl',
    defaultMessage: 'Name',
  },
  nameHint: {
    id: 'Register.nameHint',
    defaultMessage: 'e.g. John Doe',
  },
  invalidEmail: {
    id: 'Register.invalidEmail',
    defaultMessage: 'Enter valid e-mail address',
  },
  invalidPasswd: {
    id: 'Register.invalidPasswd',
    defaultMessage: 'Password must me at least 8 characters long and contain at least one letter and one digit',
  },
  invalidName: {
    id: 'Register.invalidName',
    defaultMessage: 'Name must be at least characters long',
  },
});
