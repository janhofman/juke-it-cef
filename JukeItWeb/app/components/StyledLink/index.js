import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { fullWhite, deepOrange500 } from 'material-ui/styles/colors';
import PropTypes from 'prop-types';

const styles = {
    base: {
        color: fullWhite,
        textDecoration: 'none',
        margin: '0.5em 1em',
        display: 'inline-block',
    },
    active: {
        color: deepOrange500,
    },
};

export default class StyledLink extends Component{

    render(){
        const {
            style,
            routeActive,
            to,
            children,
        } = this.props;
        let finalStyle = { ...styles.base };
        if(routeActive) {
            finalStyle = { ...finalStyle, ...styles.active };
        }
        if(style) {
            finalStyle = { ...finalStyle, ...style };
        }
        return(
            <Link 
                style={finalStyle}
                to={to}
            >
                {children}
            </Link>
        );
    }    
}

StyledLink.propTypes={
    to: PropTypes.string.isRequired,
    style: PropTypes.object,
    routeActive: PropTypes.bool,
}