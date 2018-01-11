const initialState = {
    authentication: null,
    spot: null,
    user: null,
    userId: null,
    spotId: null,
}

export default function reducer(state=initialState, action){
    switch(action.type){
        case 'LOGIN_SUCCESSFUL':
            return {...state, authentication: action.payload};
        case 'USERDATA_SET_USERID':
            return {...state, userId: action.payload};
        case 'USERDATA_SET_SPOTID':
            return {...state, spotId: action.payload};
        case 'USERDATA_SPOT_UPDATE':
            return {...state, spot: {...state.spot, ...action.payload}};  
        case 'USERDATA_USER_UPDATE':
            return {...state, user: {...state.user, ...action.payload}};
        case 'LOGOUT':
            return initialState;
        default:
            return state;
    }
}