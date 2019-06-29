import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import ScrollPane from '../../containers/ScrollPane';
import OrangeDivider from '../OrangeDivider';
import StyledTextField from '../StyledTextField';

import messages from './messages';

const styles={  
    base:{
        padding: '10px',
    },
    title: {
        fontSize: '1.5em',
        margin: '0.2em 0',
    },
    subtitle: {
        fontSize: '1.2em',
        margin: '0.2em 0',
    },
    subsubtitle: {
        fontSize: '1em',
        margin: '0.2em 0',
    },
    section:{
        padding: '10px',
        maxWidth: '400px',
    },
    subsection:{
        display: 'grid',
        gridAutoRows: '1fr',
        alignItems: 'center',
        paddingLeft: '10px',
    },
}

class Settings extends Component{    

    render(){
        const {
            intl: {
                formatMessage,
            },
            player,
            fileServer,
            onFsLocalChange,
            onFsRemoteChange,
            onPlayerLocalChange,
            onPlayerRemoteChange,
        } = this.props;
        
        return (
            <div style={styles.base}>
                <ScrollPane>
                    {/*** PLAYER SETTINGS ***/}
                    <p style={styles.title}>
                        {formatMessage(messages.playerTitle)}
                    </p>
                    <OrangeDivider />
                    <div style={styles.section}>     
                        {/*** LOCAL ***/}
                        <p style={styles.subtitle}>
                            {formatMessage(messages.playerLocalTitle)}
                        </p>
                        <div style={styles.subsection}>
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.playerLocalHostnameLabel)}
                                onChange={(event) => onPlayerLocalChange({hostname: event.target.value})}
                                value={player.local.hostname}
                            />
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.playerLocalPortLabel)}
                                onChange={(event) => onPlayerLocalChange({port: event.target.value})}
                                type={'number'}
                                value={player.local.port}
                            />
                            <Toggle 
                                label={formatMessage(messages.playerLocalLocalhostLabel)}
                                onToggle={(_, checked) => onPlayerLocalChange({localhost: checked})}
                                toggled={player.local.localhost}
                            />
                            <Toggle 
                                label={formatMessage(messages.playerLocalRunLabel)}
                                onToggle={(_, checked) => onPlayerLocalChange({runOnStart: checked})}
                                toggled={player.local.runOnStart}
                            />
                        </div>
                        {/*** REMOTE ***/}
                        <p style={styles.subtitle}>
                            {formatMessage(messages.playerRemoteTitle)}
                        </p>
                        <div style={styles.subsection}>
                        <StyledTextField
                                floatingLabelText={formatMessage(messages.playerRemoteHostnameLabel)}
                                onChange={(event) => onPlayerRemoteChange({hostname: event.target.value})}
                                value={player.remote.hostname}
                            />
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.playerRemotePortLabel)}
                                onChange={(event) => onPlayerRemoteChange({port: event.target.value})}
                                type={'number'}
                                value={player.remote.port}
                            />
                            <Toggle 
                                label={formatMessage(messages.playerConnectOnStartLabel)}
                                toggled={player.remote.connectOnStart}
                                onToggle={(_, checked) => onPlayerRemoteChange({connectOnStart: checked})}
                            />
                        </div>
                    </div>                    
                    {/*** FILE SERVER SETTINGS ***/}
                    <p style={styles.title}>
                        {formatMessage(messages.fsTitle)}
                    </p>
                    <OrangeDivider />
                    <div style={styles.section}>
                        {/*** LOCAL ***/}
                        <p style={styles.subtitle}>
                            {formatMessage(messages.fsLocalTitle)}
                        </p>
                        <div style={styles.subsection}>
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.fsLocalHostnameLabel)}
                                onChange={(event) => onFsLocalChange({hostname: event.target.value})}
                                value={fileServer.local.hostname}
                            />
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.fsLocalPortLabel)}
                                onChange={(event) => onFsLocalChange({port: event.target.value})}
                                type={'number'}
                                value={fileServer.local.port}
                            />
                            <Toggle 
                                label={formatMessage(messages.fsLocalLocalhostLabel)}
                                toggled={fileServer.local.localhost}
                                onToggle={(_, checked) => onFsLocalChange({localhost: checked})}
                            />
                            <Toggle 
                                label={formatMessage(messages.fsLocalRunLabel)}
                                toggled={fileServer.local.runOnStart}
                                onToggle={(_, checked) => onFsLocalChange({runOnStart: checked})}                                
                            />
                        </div>
                        {/*** REMOTE ***/}
                        <p style={styles.subtitle}>
                            {formatMessage(messages.fsRemoteTitle)}
                        </p>
                        <div style={styles.subsection}>
                        <StyledTextField
                                floatingLabelText={formatMessage(messages.fsRemoteHostnameLabel)}
                                onChange={(event) => onFsRemoteChange({hostname: event.target.value})}
                                value={fileServer.remote.hostname}
                            />
                            <StyledTextField
                                floatingLabelText={formatMessage(messages.fsRemotePortLabel)}
                                onChange={(event) => onFsRemoteChange({port: event.target.value})}
                                type={'number'}
                                value={fileServer.remote.port}
                            />
                            <Toggle 
                                label={formatMessage(messages.fsConnectOnStartLabel)}
                                toggled={fileServer.remote.connectOnStart}
                                onToggle={(_, checked) => onFsRemoteChange({connectOnStart: checked})}
                            />
                        </div>
                    </div>
                </ScrollPane>
            </div>
        )
    }
}

Settings.propTypes = {
    player: PropTypes.object.isRequired,
    fileServer: PropTypes.object.isRequired,
    onFsLocalChange: PropTypes.func.isRequired,
    onFsRemoteChange: PropTypes.func.isRequired,
    onPlayerLocalChange: PropTypes.func.isRequired,
    onPlayerRemoteChange: PropTypes.func.isRequired,
  };

export default injectIntl(Settings);