import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

const styles={
    base: {
        flex: '0 1 auto',
        width: '20%',
        margin: '2.5%'
    },
    image: {
        width: '100%',
    },
    title: {
        fontSize: '1.5em',
        margin: '5px'
    },
    subtitle: {
        fontSize: '1em',
        margin: '5px'
    },
    highlighted:{
        flex: '0 1 auto',
        width: '21%',
        margin: '2%'
    },
}

export default class GridItem extends Component{
    constructor(props){
        super(props);
        this.state={
            zDepth: 2,
            rounded: false,
            style: styles.base,
            ...props
        };
    }

    composeTitle(){
        if(this.state.title){
            return(
                <p style={styles.title}>{this.state.title}</p>
            );
        }
    }
    composeSubtitle(){
        if(this.state.subtitle){
            return(
                <p style={styles.subtitle}>{this.state.subtitle}</p>
            );
        }
    }

    render(){
        return(
            <Paper 
                zDepth={this.state.zDepth} 
                rounded={this.state.rounded}
                style={this.state.style}
                onMouseEnter={() => this.setState({...this.state, zDepth: 5, style: styles.highlighted})}
                onMouseLeave={() => this.setState({...this.state, zDepth: 2, style: styles.base})}
                onTouchTap={this.props.onTouchTap}
            >
                <div style={styles.image}>
                    {this.props.children}
                </div>
                <div>
                    {this.composeTitle()}
                    {this.composeSubtitle()}
                </div>
            </Paper>
        );
    }
}