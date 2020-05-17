import React, { Component } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { 
    changeSpotName,
    changeSpotDescription,
} from './../../actions/establishmentActions';
import { notify } from './../../actions/evenLogActions'
import Establishment from './../../components/Establishment';
import messages from './messages';

class EstablishmentPage extends Component{
    constructor(props){
        super(props);
        this.state = {
          editingName: false,
          editingDescription: false,
          editedNameValue: '',
          editedDescriptionValue: '',
        };
    
        this.handleBtnEditDescriptionClick = this.handleBtnEditDescriptionClick.bind(this);
        this.handleBtnCancelEditDescriptionClick = this.handleBtnCancelEditDescriptionClick.bind(this);
        this.handleDescriptionValueChange = this.handleDescriptionValueChange.bind(this);
        this.handleBtnChangeDescriptionClick = this.handleBtnChangeDescriptionClick.bind(this);
        this.handleBtnEditNameClick = this.handleBtnEditNameClick.bind(this);
        this.handleBtnCancelEditNameClick = this.handleBtnCancelEditNameClick.bind(this);
        this.handleBtnChangeNameClick = this.handleBtnChangeNameClick.bind(this);
        this.handleNameValueChange = this.handleNameValueChange.bind(this);
      }
    
    handleBtnEditDescriptionClick () {
        const { spot } = this.props;
        this.setState({
            editingDescription: true,
            editedDescriptionValue: spot.description,
        });
    }
    
    handleBtnCancelEditDescriptionClick () {
        this.setState({editingDescription: false});
    }

    handleDescriptionValueChange (event) {
        this.setState({editedDescriptionValue: event.target.value});
    }

    handleBtnChangeDescriptionClick () {
        const { 
            dispatch,
            intl: {
                formatMessage,
            }
        } = this.props;
        const { editedDescriptionValue } = this.state;

        dispatch(changeSpotDescription(editedDescriptionValue))
            .then(() => {
                this.setState({editingDescription: false});
                dispatch(notify(formatMessage(messages.successDescriptionChange)));
            })
            .catch((err) => {
                // TODO: log error
                console.log('Change spot description failed: ', err);
            });
    }
    
    handleBtnEditNameClick () {
        const { spot } = this.props;
        this.setState({
            editingName: true,
            editedNameValue: spot.name,
        });
    }
    
    handleBtnCancelEditNameClick () {
        this.setState({editingName: false});
    }

    handleNameValueChange (event) {
        this.setState({editedNameValue: event.target.value});
    }

    handleBtnChangeNameClick () {
        const { 
            dispatch,
            intl: {
                formatMessage,
            }
        } = this.props;
        const { editedNameValue } = this.state;

        if(editedNameValue.length > 0){
            dispatch(changeSpotName(editedNameValue))
                .then(() => {
                    this.setState({editingName: false});
                    dispatch(notify(formatMessage(messages.successNameChange)));
                })
                .catch((err) => {
                    // TODO: log error
                    console.log('Change spot name failed: ', err);
                });
        }      
    }

    render(){
        const {
            editingName,
            editedNameValue,
            editingDescription,
            editedDescriptionValue
        } = this.state;

        return (
            <Establishment
                {...this.props}
                onBtnEditDescriptionClick={this.handleBtnEditDescriptionClick}
                onBtnCancelEditDescriptionClick={this.handleBtnCancelEditDescriptionClick}
                onBtnChangeDescriptionClick={this.handleBtnChangeDescriptionClick}
                onDescriptionValueChange={this.handleDescriptionValueChange}
                onBtnEditNameClick={this.handleBtnEditNameClick}
                onBtnCancelEditNameClick={this.handleBtnCancelEditNameClick}
                onBtnChangeNameClick={this.handleBtnChangeNameClick}
                onNameValueChange={this.handleNameValueChange}
                editingName={editingName}
                editedNameValue={editedNameValue}
                editingDescription={editingDescription}
                editedDescriptionValue={editedDescriptionValue}
            />
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
})(injectIntl(EstablishmentPage))