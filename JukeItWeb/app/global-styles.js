import { injectGlobal } from 'styled-components';

/* eslint no-unused-expressions: 0 */
/*injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }
`;*/
injectGlobal`
body{
  background: #424242;
  font-family: 'Roboto', sans-serif;
  color: rgba(255, 255, 255, 1);
  margin: 0;
}

::-webkit-scrollbar {
    width: 10px;
    margin: 5px 0;
} /* this targets the default scrollbar (compulsory) */

::-webkit-scrollbar-track {
  box-shadow: inset 0 0 6px rgba(0,0,0,0.3); 
  border-radius: 10px;
} /* the new scrollbar will have a flat appearance with the set background color */

::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 1);
  border-radius: 10px;
  box-shadow: inset 0 0 6px rgba(0,0,0,0.5);
} /* this will style the thumb, ignoring the track */

::-webkit-scrollbar-button {
    display: none
} /* optionally, you can style the top and the bottom buttons (left and right for horizontal bars) */

::-webkit-scrollbar-corner {
    background-color: black;
} /* if both the vertical and the horizontal bars appear, then perhaps the right bottom corner also needs to be styled */

.tablink {
  font-family: 'Roboto';
  color: rgba(255, 255, 255, 1);
  text-decoration: none;
}

.tablinkActive {
  color: darkorange;
}
`;
