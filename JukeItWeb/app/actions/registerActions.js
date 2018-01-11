export function working(value){
    return({
        type: 'REGISTER_WORKING',
        payload: value,
    });
}

export function validatedEmail(valid){
    return({
        type: 'REGISTER_VALIDATED_EMAIL',
        payload: valid,
    });
}
    
export function validatedPasswd(valid){
    return({
        type: 'REGISTER_VALIDATED_PASSWD',
        payload: valid,
    });
} 

export function validatedName(valid){
    return({
        type: 'REGISTER_VALIDATED_NAME',
        payload: valid,
    });
}

export function registerError(error){
    return({
        type: 'REGISTER_ERROR',
        payload: error,
    });
}