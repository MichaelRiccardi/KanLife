// @flow

import React, { Component } from "react";
import Icon from "./Icon.js";

type Props = {
  level: number,
};

class Priority extends Component<Props> {
  render() {
    return (
      <Icon
        name={["", "arrow-down", "arrow-up", "star", "ban"][this.props.level]}
      />
    );
  }
}

export default Priority;
