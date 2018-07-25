const initialState = {

};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}
