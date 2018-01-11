// @flow
import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import ScrollPane from './../../containers/ScrollPane';
import TileGrid from './../../containers/TileGrid';
import Star from './../Star';
import Widget from './../Widget';
import OrangeDivider from './../OrangeDivider';
import messages from './messages';

const styles={
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
    widgets:{
        float: 'left',
        width: '40%',
        marginLeft: '10px', 
    },
    description: {
        float: 'right',
        width: '55%',
        marginRight: '10px',
    },
    yellow:{
        color: '#FFA3B6',
    },
    title: {
        fontSize: '1.5em',
        margin: '0.2em 0',
    },  
}

class Establishment extends Component {

    render() {
        const { formatMessage } = this.props.intl;
        const { spot, user, auth } = this.props;
        // prepare widgets
        var widgets = [];
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
                        <p style={styles.title}>{spot.name}</p>
                        <OrangeDivider/>
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
                        <p style={styles.title}>
                            {formatMessage(messages.description)}
                        </p>
                        <OrangeDivider/>
                        <p>
                            {spot.description}
                        </p>
                        <p style={styles.title}>
                            {formatMessage(messages.image)}
                        </p>
                        <OrangeDivider/>
                        <p>
                            {'here goes a picture'}
                        </p>
                    </div>
                </div>
            </ScrollPane>
        )
    }
}

export default injectIntl(Establishment);