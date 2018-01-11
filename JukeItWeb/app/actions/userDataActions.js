export function spotUpdate(spotData){
    return({
        type: 'USERDATA_SPOT_UPDATE',
        payload: spotData,
    });
}

export function userUpdate(user){
    return({
        type: 'USERDATA_USER_UPDATE',
        payload: user,
    });
}

export function setUserId(userId){
    return({
        type: 'USERDATA_SET_USERID',
        payload: userId,
    });
}

export function setSpotId(spotId){
    return({
        type: 'USERDATA_SET_SPOTID',
        payload: spotId,
    });
}

export function toggleActive(){
    return (dispatch, getState) => {
        const {userData, firebase} = getState();
        const {spot, spotId} = userData;
        firebase.database()
            .ref('spots/public')
            .child(spotId)
            .update({active: !spot.active});
    }
}