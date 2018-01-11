const initialState = {
    emptyPasswd: false,
    emptyEmail: false,
    authorizing: false,
    authorized: false,
    error: null,
}

export default function reducer(state = initialState, action){
    switch(action.type){
        case 'LOGIN_EMPTY_EMAIL':
            return {...state, emptyEmail: action.payload};
        case 'LOGIN_EMPTY_PASSWD':
            return {...state, emptyPasswd: action.payload};
        case 'LOGIN_LOGGING_IN':
            return {
                        ...state,
                        emptyPasswd: false,
                        emptyEmail: false,
                        authorizing: true,
                        error: null,
            };
        case 'LOGIN_SUCCESSFUL':
            return { 
                        ...state,
                        authorizing: false,
                        authorized: true,
            };
        case 'LOGIN_ERROR':
            return {
                ...state,
                authorizing: false,
                authorized: false,
                errorCode: action.payload.code,
                errorMessage: action.payload.message
            };
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}