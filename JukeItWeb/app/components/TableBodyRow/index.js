import React, { Component } from 'react';
import { deepOrange500, FullWhite, grey500 } from 'material-ui/styles/colors';

const styles = {
  baseStyle: {
    height: '3em',
    borderBottom: '1px solid',
    borderTop: '1px solid',
    borderColor: FullWhite,
  },
  hoveredStyle: {
    backgroundColor: deepOrange500,
  },
};


export default class TableBodyRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
    };
  }

  onMouseEnter() {
    this.setState((state) => ({
      ...state,
      hovered: true,
    }));
  }

  onMouseLeave() {
    this.setState((state) => ({
      ...state,
      hovered: false,
    }));
  }

  render() {
    // prepare props
    const { style } = this.props;
    const { hovered } = this.state;
    let finalStyle = { ...styles.baseStyle };
    if (hovered) {
      finalStyle = { ...finalStyle, ...styles.hoveredStyle };
    }
    finalStyle = { ...finalStyle, ...style };

    return (
      <tr
        style={finalStyle}
        onMouseEnter={this.onMouseEnter.bind(this)}
        onMouseLeave={this.onMouseLeave.bind(this)}
        {...this.props}
      >
        {this.props.children}
      </tr>
    );
  }
}
