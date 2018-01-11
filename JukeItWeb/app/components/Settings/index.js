import React, { Component } from 'react';
import { injectIntl } from 'react-intl'

import messages from './messages';

class Settings extends Component{    

    render(){
        const { formatMessage } = this.props.intl;
        return (
            <div>
            </div>
        )
    }
}

export default injectIntl(Settings);