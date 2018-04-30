import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TableHead from '../TableHead';

// import { deepOrange500, FullWhite, grey500 } from 'material-ui/styles/colors';

const styles = {
  baseStyle: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  fixedWidth: {
    tableLayout: 'fixed',
  },
};

const style = {
  host: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    overflowY: 'auto',
    position: 'relative',
    WebkitOverflowScrolling: 'touch',
  },
  content: {
    width: '100%',
    height: '100%',
  },
};


export default class Table extends Component {
  constructor(props) {
    super(props);
    this.state = { scrollHeight: 0 };
  }

  componentDidMount() {
    this.onScrollListener = this.el.addEventListener('scroll', this.refresh.bind(this));
    this.refresh();
  }

  componentWillReceiveProps(props) {
    if (props.items !== this.props.items) {
      this.previousStart = undefined;
      this.previousEnd = undefined;
    }
    this.refresh();
  }

  componentWillUnmount() {
    if (this.onScrollListener !== undefined) {
      this.onScrollListener();
    }
  }

  onScrollListener = null;
  previousStart = -1;
  previousEnd = -1;
  startupLoop = true;
  el = null;
  content = null;
  lastUpdate = 0;
  timer;

  calculateDimensions() {
    const items = this.props.items || [];
    const itemCount = items.length;
    const viewWidth = this.el.clientWidth - (this.props.scrollbarWidth || 0);
    const viewHeight = this.el.clientHeight - (this.props.scrollbarHeight || 0);

    let contentDimensions;
    if (this.props.childWidth === undefined || this.props.childHeight === undefined) {
      contentDimensions = this.content.children[1] ? this.content.children[1].getBoundingClientRect() : {
        width: viewWidth,
        height: viewHeight,
      };
    }
    const childWidth = this.props.childWidth || contentDimensions.width;
    const childHeight = this.props.childHeight || contentDimensions.height;

    const itemsPerCol = Math.max(1, Math.floor(viewHeight / childHeight));
    const scrollTop = Math.max(0, this.el.scrollTop);

    return {
      itemCount,
      viewWidth,
      viewHeight,
      childWidth,
      childHeight,
      itemsPerCol,
    };
  }

  calculateItems() {
    const d = this.calculateDimensions();
    const items = this.props.items || [];
    const scrollHeight = d.itemsPerCol === 1 ? d.childHeight : d.childHeight * d.itemCount;
    if (this.el.scrollTop > scrollHeight) {
      this.el.scrollTop = scrollHeight;
    }

    const scrollTop = Math.max(0, this.el.scrollTop);
    const indexByScrollTop = (scrollTop / scrollHeight) * d.itemCount;
    let end = Math.min(d.itemCount, Math.floor(indexByScrollTop) + (d.itemsPerCol + 1));

    const maxStartEnd = end;
    const maxStart = Math.max(0, maxStartEnd - d.itemsPerCol);
    let start = Math.min(maxStart, Math.floor(indexByScrollTop));

    let topPadding = d.childHeight * start;
    topPadding = !isNaN(topPadding) ? topPadding : 0;
    this.setState({ topPadding, scrollHeight });

    start = !isNaN(start) ? start : 0;
    end = !isNaN(end) ? end : 0;
    console.log('start:', start, 'end:', end, 'dimensions:', d);
    if (start !== this.previousStart || end !== this.previousEnd) {
      // update the scroll list
      if (typeof this.props.getRow === 'function') {
        const scrollItems = items.slice(start, end);
        this.setState({ items: scrollItems });
        if (typeof this.props.onUpdate === 'function') {
          this.props.onUpdate(scrollItems);
        }
      }

      // emit 'start' event
      if (typeof this.props.onStart === 'function') {
        if (start !== this.previousStart && this.startupLoop === false) {
          this.props.onStart({ start, end });
        }
      }

      // emit 'end' event
      if (typeof this.props.onEnd === 'function') {
        if (end !== this.previousEnd && this.startupLoop === false) {
          this.props.onEnd({ start, end });
        }
      }

      this.previousStart = start;
      this.previousEnd = end;

      if (this.startupLoop === true) {
        this.refresh();
      } else if (typeof this.props.onChange === 'function') {
        this.props.onChange({ start, end });
      }
    } else if (this.startupLoop === true) {
      this.startupLoop = false;
      if (typeof this.props.onChange === 'function') {
        this.props.onChange({ start, end });
      }
      this.refresh();
    }
  }

  refresh() {
    console.log('refresh called!!!')
    requestAnimationFrame(() => this.calculateItems());
    // this.calculateItems();
  }

  render() {
    console.log('rendering table');
    console.log('state:', this.state);
    console.log('props:', this.props);
    return (
      <div ref={(el) => this.el = el} style={style.host}>
        <div style={{ height: `${this.state.scrollHeight}px` }} >
        <table style={styles.baseStyle}>
          {/*this.props.head ? this.props.head : null*/}
          <tbody
            ref={(el) => this.content = el}
          >
            <tr style={{ height: `${this.state.topPadding}px` }} />
            {(this.state.items || []).map(this.props.getRow)}
          </tbody>
        </table>
        </div>
      </div >
    );
  }
}

Table.propTypes = {
  fixedWidth: PropTypes.bool,
  style: PropTypes.object,
  head: PropTypes.instanceOf(TableHead),
  getRow: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  children: PropTypes.any,
};
