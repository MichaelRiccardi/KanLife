// @flow

import React, { Component } from "react";

import Icon from "./Icon.js";

export type StyleAttributes = {
  classNames?: string,
  customStyle?: Object,
};

type Props = {
  styleAttributes?: StyleAttributes,
  icon: string,
  text: string,
};

class Attribute extends Component<Props> {
  render() {
    const { styleAttributes, icon, text } = this.props;

    return (
      <span
        className={
          "card-link highlight " +
          (styleAttributes ? styleAttributes.classNames || "" : "")
        }
        style={styleAttributes ? styleAttributes.customStyle : {}}
      >
        <Icon name={icon} />
        {text}
      </span>
    );
  }
}

export default Attribute;
