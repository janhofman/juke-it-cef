import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { fullWhite, deepOrange500 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

const style={
    color: fullWhite,
    textDecoration: 'none',
    margin: '0.5em 1em',
    display: 'inline-block',
}

const activeStyle={
    color: deepOrange500,
}

export default class StyledLink extends Component{

    render(){
        return(
            <Link style={style} {...this.props} />
        );
    }    
}

StyledLink.propTypes={
    to: PropTypes.string.isRequired,
}