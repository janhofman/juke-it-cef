import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class MillisToTime extends Component{
    millisToTime(millis){
        var seconds = Math.floor(millis/1000);
        var minutes = Math.floor(seconds/60);
        var hours = Math.floor(minutes/60);
        minutes %= 60;
        seconds %= 60;
        var time = "";
        if(hours){
            time += hours + ":";
            if(minutes < 10){
                time += "0";
            }
        }
        time += minutes + ":";
        if(seconds < 10){
            time += "0";
        }
        time += seconds;
        return(time);
    }

    render(){
        const {value} = this.props;
        return(
            <span>
                {this.millisToTime(value)}
            </span>
        );
    }
}

MillisToTime.propTypes={
    value: PropTypes.number.isRequired,
}