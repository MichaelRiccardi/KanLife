// @flow

import React, { Component } from "react";
import Icon from "./Icon.js";

type Props = {
  level: number
};

class Priority extends Component<Props> {
  render() {
    const classNames =
      this.props.level > 0
        ? "fa fa-" +
          ["arrow-down", "arrow-up", "star", "ban"][this.props.level - 1]
        : "";
    return <i className={classNames} aria-hidden="true" />;
  }
}

export default Priority;
