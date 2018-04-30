import React, { Component } from 'react';
// import { deepOrange500, FullWhite, grey500 } from 'material-ui/styles/colors';

const baseStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};


export default class TableHeadCell extends Component {
  render() {
    // prepare props
    const style = { ...baseStyle, ...this.props.style };
    return (
      <th
        style={style}
      >
        {this.props.children}
      </th>
    );
  }
}
