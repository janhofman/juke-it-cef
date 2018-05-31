export function makeCancelable(promise) {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val) => hasCanceled_ ? reject({ isCanceled: true }) : resolve(val),
      (error) => hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    },
  };
}

export const EntityEnum = {
  GENRE: 'genre',
  ARTIST: 'artist',
  ALBUM: 'album',
  PLAYLIST: 'playlist',
};

export class Song {
  constructor() {
    this.album = null;
    this.artist = null;
    this.genre = null;
    this.title = null;
    this.length = null;
    this.path = null;
    this.id = null;
  }
}

export function sanitizeQueryParameter(parameter) {
  if (parameter && parameter.length) {
    let sanitized = '';
    for (let i = 0; i < parameter.length; i++) {
      const char = parameter[i];
      switch (char) {
        case '\\':
        case '=':
        case '&':
          sanitized += '\\';
          break;
        default:
          break;
      }
      sanitized += char;
    }
    return sanitized;
  }
  return parameter;
}

export function buildQueryString(params) {
  if (params) {
    const keys = Object.keys(params);
    let first = true;
    let str = '';
    keys.forEach((key) => {
      if (params[key]) {
        if (first) {
          str += '?';
          first = false;
        } else {
          str += '&';
        }
        str += `${key}=${sanitizeQueryParameter(params[key])}`;
      }
    });
    return str;
  }
}
