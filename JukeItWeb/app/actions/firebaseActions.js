// This file should contain all calls to firebase for an easy overview of firebase usage
// - functions should only call the required functions on firebase object
// - firebase object should be provided as first parameter by dependency injection
// - firebase functions that return promise should return this promise so it can be handled
//   by the calling function

/**
 * Changes the name of the spot to new name
 * @param {object} firebase firebase object
 * @param {string} spotId current spot ID
 * @param {string} newName new spot name
 * @returns {Promise}
 */
export function changeSpotName (firebase, spotId, newName) {
    return firebase.database()
        .ref('spots')
        .child('public')
        .child(spotId)
        .child('name')
        .set(newName);
}

/**
 * Changes the description of the spot
 * @param {object} firebase firebase object
 * @param {string} spotId current spot ID
 * @param {string} description new spot description
 * @returns {Promise}
 */
export function changeSpotDescription (firebase, spotId, description) {
    return firebase.database()
        .ref('spots')
        .child('public')
        .child(spotId)
        .child('description')
        .set(description);
}
