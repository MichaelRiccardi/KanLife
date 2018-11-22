// @flow

import React, { Component } from 'react';

type Props = {
    name: string,
}

class Icon extends Component<Props> {

    render() {
        return (
            <i className={"fa fa-"+this.props.name} aria-hidden="true"></i>
        );
    }
}

export default Icon;
