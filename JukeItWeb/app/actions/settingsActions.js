import {
    initialize as initilaizeDevices,
} from './devicesActions';

export function fsLocalChange(changes) {
    return {
        type: 'SETTINGS_FS_LOCAL_CHANGE',
        payload: changes,
    };
}

export function fsRemoteChange(changes) {
    return {
        type: 'SETTINGS_FS_REMOTE_CHANGE',
        payload: changes,
    };
}

export function playerLocalChange(changes) {
    return {
        type: 'SETTINGS_PLAYER_LOCAL_CHANGE',
        payload: changes,
    };
}

export function playerRemoteChange(changes) {
    return {
        type: 'SETTINGS_PLAYER_REMOTE_CHANGE',
        payload: changes,
    };
}

export function save() {
    return (dispatch, getState) => {
        const { settings, cefQuery } = getState();
        if (settings.unsavedChanges === true) {
            const requestObj = { 
                command: 'CFG_SAVE_CONFIG',
                payload: {
                    player: settings.player,
                    fileServer: settings.fileServer,
                }, 
            };

            const request = JSON.stringify(requestObj);

            cefQuery({
                request,
                onSuccess: (response) => dispatch(settingsSaved()),
                onFailure: (errorCode, errorMessage) => {
                    console.log("Saving settings failed. Code: ", errorCode, ", Message: ", errorMessage);
                }
            });
        }
    }
}

export function load() {
    return (dispatch, getState) => {
        const { cefQuery } = getState();
        
        const requestObj = { 
            command: 'CFG_GET_CONFIG',
        };

        const request = JSON.stringify(requestObj);

        cefQuery({
            request,
            onSuccess: (responseJSON) => {
                try {
                    const response = JSON.parse(responseJSON);
                    console.log('settings: ', response);
                    dispatch(settingsLoaded(response.player, response.fileServer));
                } catch (e) { console.log('Parsing settings failed. ', e) }

                dispatch(initilaizeDevices());
            },
            onFailure: (errorCode, errorMessage) => {
                console.log("Loading settings failed. Code: ", errorCode, ", Message: ", errorMessage);
                // dispatch initialization anyway, reducer defaults will be initialized
                dispatch(initilaizeDevices());
            }
        });        
    }
}

function settingsLoaded(player, fileServer) {
    return {
        type: 'SETTINGS_LOADED',
        payload: {
            player, 
            fileServer,
        }
    };
}

function settingsSaved(){
    return {
        type: 'SETTINGS_SAVED'
    };
}