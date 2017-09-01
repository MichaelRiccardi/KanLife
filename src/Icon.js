import React, { Component } from 'react';

class Icon extends Component {

    state = {
        classNames: "fa fa-"+this.props.name
    }
    render() {
        return (
            <i className={this.state.classNames} aria-hidden="true"></i>
        );
    }
}

export default Icon;