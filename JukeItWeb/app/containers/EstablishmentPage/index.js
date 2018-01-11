import React, { Component } from 'react';
import { connect } from 'react-redux';
import Establishment from './../../components/Establishment';

class EstablishmentPage extends Component{

    render(){
        return (
            <Establishment {...this.props}/>
        );
    }
}

export default connect((store) => {
    const userData = store.userData;
    return({
        spot: userData.spot,
        user: userData.user,
        auth: userData.authentication,
    });
})(EstablishmentPage)