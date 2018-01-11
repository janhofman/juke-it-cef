import React, { Component } from 'react';

export default class ScrollPane extends Component {
    constructor(props){
        super(props);
        this.resize = this.resize.bind(this);
        this.state={            
            height: 0
        }        
    }
    computeHeight(elem){
        var box = elem.getBoundingClientRect();
	    var body = document.body;
	    var docElem = document.documentElement;
	    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
	    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
	    var clientTop = docElem.clientTop || body.clientTop || 0;
	    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
	    var top  = box.top +  scrollTop - clientTop;
	    var left = box.left + scrollLeft - clientLeft;
        var pageHeight = body.clientHeight;
        var ownHeight = box.bottom - box.top;
        var bottom = pageHeight - top - ownHeight;
        var viewportHeight = Math.max(docElem.clientHeight, window.innerHeight || 0);
        var height = Math.floor(viewportHeight - top - bottom);        
        //console.log('top: ', top, ' bottom: ' , bottom, ' ownHeight: ', ownHeight, ' viewport: ', viewportHeight );
	    return (height > 0 ? height : 100);
    }
    resize(){
        var elem = document.getElementById('scrollPane');
        this.setState({height: this.computeHeight(elem)})
    }
    componentDidMount(){        
        this.resize();
        if( typeof window !== 'undefined' )
            window.addEventListener('resize', this.resize, false)
    }

    componentWillReceiveProps(){
        this.resize();
    }

    componentWillUnmount(){
        if( typeof window !== 'undefined' )
            window.removeEventListener('resize', this.resize, false)
    }

    render(){
        var style = {
            height: this.state.height + 'px',
            overflow: 'auto',
        };
        const {unscrollable} = this.props;
        if(unscrollable){
            style.overflow = 'hidden'
        }
        return(
            <div 
                id={'scrollPane'}
                style={style}
            >
                {this.props.children}
            </div>
        );
    }
}