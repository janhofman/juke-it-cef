import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { deepOrange500, FullWhite, grey500 } from 'material-ui/styles/colors';

const styles = {
    underline:{
        borderColor: deepOrange500,
    },
    focus: {
        color: deepOrange500,
    },
    placeholder: {
        color: grey500,
    },
    textStyle: {
        fontColor: FullWhite,
        fontFamily: 'Roboto, sans-serif',
    },
}

export default class StyledTextField extends Component{
    render(){
        return (
            <TextField
                inputStyle={ styles.textStyle }
                floatingLabelStyle={ styles.placeholder }
                floatingLabelFocusStyle={ styles.focus }
                hintStyle={ styles.placeholder }
                fullWidth={true}
                underlineStyle={ styles.underline }
                underlineFocusStyle={ styles.underline }
                { ...this.props}
            />
        );
    }
}
