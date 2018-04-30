import React, { Component } from 'react';
// import { deepOrange500, FullWhite, grey500 } from 'material-ui/styles/colors';

const baseStyle = {
  textAlign: 'left',
};
const rowStyle = {
  height: '3em',
};


export default class TableHead extends Component {
  render() {
    // prepare props
    const style = { ...baseStyle, ...this.props.style };
    return (
      <thead
        style={style}
      >
        <tr style={rowStyle}>
          {this.props.children}
        </tr>
      </thead>
    );
  }
}
