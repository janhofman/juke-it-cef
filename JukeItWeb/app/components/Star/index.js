import React, { Component,PropTypes } from 'react';
import Star1 from 'material-ui/svg-icons/toggle/star';
import { grey500, yellow400, yellow600 } from 'material-ui/styles/colors';

export default class Star extends Component{
    static propTypes={
        active: PropTypes.bool.isRequired,
        style: PropTypes.object,
    }
    render(){
        return(
            <Star1 style={Object.assign({}, this.props.style)} color={ this.props.active ? yellow600 : grey500 }/>
        );
    }
}