import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import IconButton from 'material-ui/IconButton';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import CheckIcon from 'material-ui/svg-icons/navigation/check';
import CancelIcon from 'material-ui/svg-icons/navigation/close';
import ScrollPane from './../../containers/ScrollPane';
import TileGrid from './../../containers/TileGrid';
import StyledTextField from './../StyledTextField';
import Star from './../Star';
import Widget from './../Widget';
import OrangeDivider from './../OrangeDivider';
import messages from './messages';

const styles = {
    /*
    wrapper: {
        position: 'relative',
    },
    widgets:{
        position: 'relative',
        top: 0,
        left: 0,
        width: '40%',
    },
    description: {
        marginLeft: '45%',
    },
    */
  wrapper: {

  },
  widgets: {
    float: 'left',
    width: '40%',
    marginLeft: '10px',
  },
  description: {
    float: 'right',
    width: '55%',
    marginRight: '10px',
  },
  yellow: {
    color: '#FFA3B6',
  },  
  title: {
    fontSize: '1.5em',
    margin: '0.2em 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descriptionPar: {
    whiteSpace: 'pre-wrap',
  },
};

class Establishment extends Component {
  render() {
    const { 
      spot, 
      user,
      auth,
      editingName,
      editedNameValue,      
      editingDescription,
      editedDescriptionValue,
      onBtnEditDescriptionClick,
      onBtnCancelEditDescriptionClick,
      onBtnChangeDescriptionClick,
      onDescriptionValueChange,
      onBtnEditNameClick,
      onBtnCancelEditNameClick,
      onBtnChangeNameClick,
      onNameValueChange,
      intl: {
        formatMessage,
      },
    } = this.props;
    // prepare widgets
    const widgets = [];
    widgets.push({
      title: formatMessage(messages.address),
      items: [spot.address],
    });
    widgets.push({
      title: formatMessage(messages.user),
      items: [user.name, auth.email],
    });

    return (
      <ScrollPane>
        <div style={styles.wrapper}>
          <div style={styles.widgets}>            
            {
              editingName
              ? (
                <div style={styles.title}>
                  <div style= {{flexGrow: 1}}> 
                  <StyledTextField                    
                    value={editedNameValue}
                    onChange={onNameValueChange}
                    floatingLabelText={formatMessage(messages.tbEditNameLbl)}
                    errorText={editedNameValue.length === 0 ? formatMessage(messages.tbEditNameEmptyErr) : null}                    
                  />
                  </div>
                  <div style= {{flexGrow: 0}}>
                    <IconButton
                      onTouchTap={onBtnChangeNameClick}
                      disabled={editedNameValue.length === 0}
                    >
                      <CheckIcon/>
                    </IconButton>
                    <IconButton
                      onTouchTap={onBtnCancelEditNameClick}
                    >
                      <CancelIcon/>
                    </IconButton>
                  </div>
                </div>
              )
              : (
                <div style={styles.title}>
                  {spot.name}
                  <IconButton
                  onTouchTap={onBtnEditNameClick}
                  >
                    <EditIcon/>
                  </IconButton>
                </div>
              )
            }
            <OrangeDivider />
            <TileGrid>
              {
                widgets.map((widget, idx) =>
                    (
                      <Widget
                        title={widget.title}
                        items={widget.items}
                        key={idx}
                      />
                    ))
            }
            </TileGrid>
          </div>
          <div style={styles.description}>
            <div style={styles.title}>
              {formatMessage(messages.description)}
              {
                editingDescription
                ? (
                  <div>
                    <IconButton
                      onTouchTap={onBtnChangeDescriptionClick}
                    >
                      <CheckIcon/>
                    </IconButton>
                    <IconButton
                      onTouchTap={onBtnCancelEditDescriptionClick}
                    >
                      <CancelIcon/>
                    </IconButton>
                  </div>
                )
                : (
                  <IconButton
                    onTouchTap={onBtnEditDescriptionClick}
                  >
                    <EditIcon/>
                  </IconButton>
                )
              }      
            </div>
            <OrangeDivider />
            {
              editingDescription
              ? (
                <StyledTextField
                  value={editedDescriptionValue}
                  onChange={onDescriptionValueChange}
                  floatingLabelText={formatMessage(messages.tbEditDescriptionLbl)}
                  multiLine={true}
                  rowsMax={20}
                />
              )
              : (
                <p style= {styles.descriptionPar}>
                  {spot.description}
                </p>                
              )
            }
            
            <p style={styles.title}>
              {formatMessage(messages.image)}
            </p>
            <OrangeDivider />
            <p>
              {'here goes a picture'}
            </p>
          </div>
        </div>
      </ScrollPane>
    );
  }
}

export default Establishment;
