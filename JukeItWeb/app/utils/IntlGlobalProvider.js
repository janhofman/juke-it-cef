// from https://stackoverflow.com/questions/36648880/use-react-intl-translated-messages-in-redux-middleware
import { intlShape } from 'react-intl'

// ======================================================
// React intl passes the messages and format functions down the component
// tree using the 'context' scope. the injectIntl HOC basically takes these out
// of the context and injects them into the props of the component. To be able to 
// import this translation functionality as a module anywhere (and not just inside react components),
// this function inherits props & context from its parent and exports a singleton that'll 
// expose all that shizzle.
// ======================================================
var INTL
const IntlGlobalProvider = (props, context) => {
  INTL = context.intl  
  return props.children
}

IntlGlobalProvider.contextTypes = {
  intl: intlShape.isRequired
}

// ======================================================
// Class that exposes translations
// ======================================================
var instance
class IntlTranslator {
  // Singleton
  constructor() {
    if (!instance) {
      instance = this;
    }
    return instance;
  }

  // ------------------------------------
  // Formatting Functions
  // ------------------------------------
  formatMessage (message, values) {
    return INTL.formatMessage(message, values)
  }
}



// ------------------------------------
// Import it anywhere as a module
// ------------------------------------
// import { defineMessages } from 'react-intl'
// import { intl } from 'modules/core/IntlGlobalProvider'

// const intlStrings = defineMessages({
//   translation: {
//     id: 'myid',
//     defaultMessage: 'Hey there',
//     description: 'someStuff'
//   },
// })
// intl.formatMessage(intlStrings.translation)
export const intl = new IntlTranslator()
export default IntlGlobalProvider