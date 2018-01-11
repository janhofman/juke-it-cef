import React, { Component } from 'react';
import {grey300} from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress'; 
import PropTypes from 'prop-types';

const styles = {
    wrapper: {
        position: 'relative'
    },
    shadow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(66, 66, 66, 0.4)',
        zIndex: 100,
    },
    progress: {
        display: 'block',
        margin: 'auto',
    },
    progressWrapper: {
        position: 'fixed',
        top:'50%',
        left:'50%',
        marginLeft:'-30px',
        marginTop:'-30px',        
    }
}

export default class LoadScreen extends Component{    
    render(){
        const {loading, children} = this.props;
        return(
            <div style={styles.wrapper}>
                {children}
                {loading ? (<div style={styles.shadow}/>) : null}   
                {loading ? 
                    (
                        <div style={styles.progressWrapper}>
                            <CircularProgress
                                size={60}
                                color={grey300}
                                style={styles.progress}
                            />
                        </div>
                    ) : null
                }
                             
            </div>
        );
    }
}

LoadScreen.propTypes = {
    loading: PropTypes.bool.isRequired,
}