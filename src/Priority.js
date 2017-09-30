import React, { Component } from 'react';
import Icon from './Icon.js';

class Priority extends Component {

    state = {
        classNames: (this.props.level > 0) ? "fa fa-"+(["arrow-down","arrow-up","star","ban"][this.props.level-1]) : ""
    }
    render() {
        return (
            <i className={this.state.classNames} aria-hidden="true"></i>
        );
    }
}

export default Priority;