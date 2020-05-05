import {
    changeSpotName as fb_changeSpotName,
    changeSpotDescription as fb_changeSpotDescription
} from './firebaseActions';

/**
 * Changes the name of the spot to new name
 * @param {*} newName new spot name
 * @returns {Thunk} 
 */
export function changeSpotName (newName) {
    return (dispatch, getState) => {
        const {
          userData: {
            spotId,
          },
          firebase
        } = getState();

        return fb_changeSpotName(firebase, spotId, newName);
    }
}

/**
 * Changes the description of the spot
 * @param {*} description new description
 * @returns {Thunk} 
 */
export function changeSpotDescription (description) {
    return (dispatch, getState) => {
        const {
          userData: {
            spotId,
          },
          firebase
        } = getState();

        return fb_changeSpotDescription(firebase, spotId, description)
    }
}