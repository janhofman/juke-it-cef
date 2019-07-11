import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import PropTypes from 'prop-types';
import OrangeDivider from './../OrangeDivider';

const styles={
    title: {
        fontSize: '1.5em',
        margin: '0.2em 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collapsedTitle: {
        fontSize: '1em',        
        margin: '1em 0.2em',  
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',        
        whiteSpace: 'nowrap',
    },
    base: {        
        boxSizing: 'border-box',
        boxShadow: '3px 6px 10px black',
    },
    children: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
    },
    contentBox: {
        display: 'flex',
        flexFlow: 'column',
        height:'100%'
    },    
    iconButton: { 
        verticalAlign: 'middle',        
        height: '1.5em',
    }
}

export default class PlaybackWidget extends Component{
    render(){
        const {
            open,
            children,
            title,
            style,
            onToggle,
        } = this.props;

        let finalStyle = {...styles.base};
        if(style){
            finalStyle = {...finalStyle, ...style};
        }

        return(            
            <div 
                style={finalStyle}
                onClick={open ? null : onToggle}
            >
                {open ? (
                    <div style={styles.contentBox}>
                        <p style={styles.title}>
                            {title}
                            <IconButton
                                style={style.iconButton}
                                onTouchTap={onToggle}
                            >
                                <CloseIcon/>
                            </IconButton>
                        </p>
                        <OrangeDivider/>
                        <div style={styles.children}>
                        {children}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p style={styles.collapsedTitle}>
                            {title}
                        </p>
                    </div>
                )}
            </div>
        );
    }
}

PlaybackWidget.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    onToggle: PropTypes.func.isRequired,
}