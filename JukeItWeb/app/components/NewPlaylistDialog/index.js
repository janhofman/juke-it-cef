// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import StyledTextField from './../StyledTextField';
import messages from './messages';

const styles={
    wrapper: {
        //position: 'fixed',
        //top:'50%',
        //left:'50%',
        //margin: 'auto',
        width: '660px', 
        height: '330px',    
        //marginTop: '-165px', /* Negative half of height. */
        //marginLeft: '-310px', /* Negative half of width. */
        //zIndex: 100,
    },
    imageChooser: {
        float: 'left',
        width: '200px',
        height: '200px',
        margin: '10px',
        border: '1px dashed black',
        textAlign: 'center',
    },
    inputs: {
        float: 'right',
        margin: '10px',
    },
    button: {
        margin: '10px 20px',
        width: '7em',
    },
    title: {
        textAlign: 'center',
        margin: '10px',
        fontSize: '1.2em',
    },
    buttonsSection: {
        clear:'both',
        textAlign: 'right',
    },
    imageButton: {
        marginTop:'150px',
    },
}

class NewPlaylistDialog extends Component{
    constructor(props){
        super(props);
        this.state={
            name: '',
            description: '',
            image: null,
        }
    }

    onNameChange(e, newValue){
        this.setState((state) => {return{...state, name: newValue}})
    }

    onDescriptionChange(e, newValue){
        this.setState((state) => {return{...state, description: newValue}})
    }

    render(){        
        const { formatMessage } = this.props.intl;
        const {
            handleCancel,
            handleSave,
            open,
        } = this.props;
        const {name, description, image} = this.state;
        const actions = [
            <FlatButton
                label={formatMessage(messages.saveBtn)}
                containerElement="label"
                //style={styles.button}
                onTouchTap={() => handleSave(name, description, image)}
            />,
            <FlatButton
                label={formatMessage(messages.cancelBtn)}
                containerElement="label"
                //style={styles.button}
                onTouchTap={handleCancel}
            />
        ];
        return (
            <Dialog 
                actions={actions}
                contentStyle={styles.wrapper} 
                title={formatMessage(messages.title)}
                modal={true}
                open={open}
            >
                <div style={styles.imageChooser}>
                    <FlatButton
                    label={'Choose image'}
                    containerElement="label"
                    style={styles.imageButton}
                />
                </div>
                <div style={styles.inputs}>
                    <StyledTextField 
                        hintText={formatMessage(messages.nameHint)}
                        floatingLabelText={formatMessage(messages.nameLabel)}
                        onChange={this.onNameChange.bind(this)}
                    />
                    <StyledTextField 
                        hintText={formatMessage(messages.descriptionHint)}
                        floatingLabelText={formatMessage(messages.descriptionLabel)}
                        multiLine={true}
                        rows={1}
                        rowsMax={3}
                        onChange={this.onDescriptionChange.bind(this)}
                    />
                </div>                
            </Dialog>
        );
    }
}

NewPlaylistDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleCancel: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
}

export default injectIntl(NewPlaylistDialog);