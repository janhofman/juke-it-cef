import React, { Component } from 'react';
import { deepOrange500, fullWhite } from 'material-ui/styles/colors';
import CircularProgress from 'material-ui/CircularProgress';
import defaultRowRenderer from 'react-virtualized/dist/es/Table/defaultRowRenderer';

const styles = {
  hoveredStyle: {
    backgroundColor: deepOrange500,
  },
  rowStyle: {
    boxSizing: 'border-box', // count border as part of the row
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: fullWhite,
    fontSize: '15px',
  },
  progress: {
    display:'block', 
    margin: 'auto',
  },
};


export default class TableBodyRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
    };
  }

  onMouseOver() {
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
    let finalStyle = { ...styles.rowStyle, ...style };
    if (hovered) {
      finalStyle = { ...finalStyle, ...styles.hoveredStyle };
    }
    const finalProps = {
      ...this.props, 
      style: finalStyle,
      onRowMouseOver: this.onMouseOver.bind(this),
      onRowMouseOut: this.onMouseLeave.bind(this),
    };

    if(finalProps.rowData.loading) {  
      // show progressbar for loading row
      return(
        <div style={finalStyle}>          
          <CircularProgress size={40} thickness={3} color={deepOrange500} style={styles.progress}/>
        </div>
      );
    } else {      
      return defaultRowRenderer(finalProps);
    }
  }
}
