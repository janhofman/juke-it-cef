import React, { Component } from 'react';
import { deepOrange500 } from 'material-ui/styles/colors';

const style={
    margin: '-1px 0px 0px',
    height: '1px',
    border: 'none',
    backgroundColor: deepOrange500,
}

export default class OrangeDivider extends Component{
    render(){
        return(
            <hr style={style}/>
        );
    }
}