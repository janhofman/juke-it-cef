const initialState = {
  working: false,
  invalidEmail: false,
  invalidPasswd: false,
  invalidName: false,
  error: null,
};

export default function reducer(state = initialState, action) {
  const { payload } = action;
  switch (action.type) {
    case 'REGISTER_WORKING':
      return { ...state, working: payload };
    case 'REGISTER_VALIDATED_EMAIL':
      return { ...state, invalidEmail: !payload };
    case 'REGISTER_VALIDATED_PASSWD':
      return { ...state, invalidPasswd: !payload };
    case 'REGISTER_VALIDATED_NAME':
      return { ...state, invalidName: !payload };
    case 'REGISTER_ERROR':
      return { ...state, error: payload };
    case 'LOGIN_SUCCESSFUL':
      return { ...state, error: null };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
