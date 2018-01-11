import React, { Component } from 'react';

const styles={
    base: {
        width: '100%',
        //height: '100%',
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        alignContent: 'flex-start'
    }
}

export default class TileGrid extends Component{

    render(){
        return(
            <div style={styles.base}>
                {this.props.children}
            </div>
        );
    }
}