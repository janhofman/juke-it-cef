import React, { Component } from 'react';

export default class ScrollPane extends Component {
  constructor(props) {
    super(props);
    this.setTopDivRef = element => {
      this.topDiv = element;
    };
    this.resize = this.resize.bind(this);
    this.state = {
      height: 0,
    };
  }

  computeHeight(elem) {
    const box = elem.getBoundingClientRect();
    const body = document.body;
    const docElem = document.documentElement;
    const scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    const scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    const clientTop = docElem.clientTop || body.clientTop || 0;
    const clientLeft = docElem.clientLeft || body.clientLeft || 0;
    const top = box.top + scrollTop - clientTop;
    const left = box.left + scrollLeft - clientLeft;
    const pageHeight = body.clientHeight;
    const ownHeight = box.bottom - box.top;
    const bottom = pageHeight - top - ownHeight;
    const viewportHeight = Math.max(docElem.clientHeight, window.innerHeight || 0);
    const height = Math.floor(viewportHeight - top - bottom);
        // console.log('top: ', top, ' bottom: ' , bottom, ' ownHeight: ', ownHeight, ' viewport: ', viewportHeight );
    return (height > 0 ? height : 100);
  }

  resize() {
    this.setState({ height: this.computeHeight(this.topDiv) });
  }
  
  componentDidMount() {
    this.resize();
    if (typeof window !== 'undefined') { window.addEventListener('resize', this.resize, false); }
  }

  componentWillReceiveProps() {
    this.resize();
  }

  componentWillUnmount() {
    if (typeof window !== 'undefined') { window.removeEventListener('resize', this.resize, false); }
  }

  render() {
    const style = {
      height: `${this.state.height}px`,
      overflow: 'auto',
    };
    const { unscrollable } = this.props;
    if (unscrollable) {
      style.overflow = 'hidden';
    }
    return (
      <div
        ref={this.setTopDivRef}
        style={style}
      >
        {this.props.children}
      </div>
    );
  }
}
