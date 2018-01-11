export function makeCancelable(promise){
  var hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCanceled_ ? reject({isCanceled: true}) : resolve(val),
      error => hasCanceled_ ? reject({isCanceled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
};

export const EntityEnum = {
  GENRE: 'genre',
  ARTIST: 'artist',
  ALBUM: 'album',
};

export class Song {
  constructor(){
      this.album =  null;
      this.artist = null;
      this.genre = null;
      this.title = null;
      this.length = null;
      this.path = null;
      this.id = null;
  };
}