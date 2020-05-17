import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import OrangeDivider from './../OrangeDivider';

const styles={
    base: {
        flex: '0 1 auto',
        width: '45%',
        margin: '2.5%',
        padding: '10px'
    },
    title: {
        fontSize: '1.5em',
        margin: '0.2em 0',
    },    
    list:{
        listStyleType: 'none',
        paddingLeft: 0,
        margin: '0.2em 0',
    }
}

export default class Widget extends Component{
    constructor(props){
        super(props);
        this.state={
            zDepth: 3,
            rounded: false,
            style: styles.base,
            ...props
        };
    }

    render(){
        return(
            <Paper 
                zDepth={this.state.zDepth} 
                rounded={this.state.rounded}
                style={this.state.style}
            >
                <p style={styles.title}>
                    {this.props.title}
                </p>
                <OrangeDivider/>
                <ul style={styles.list}>
                    {
                        this.props.items.map((item, idx) =>
                            (
                                <li key={idx}>
                                    {item}
                                </li>
                            )
                        )
                    }
                </ul>
            </Paper>
        );
    }
}