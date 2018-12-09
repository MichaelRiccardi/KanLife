// @flow

import React, { Component } from "react";

import Attribute from "./Attribute.js";
import Icon from "./Icon.js";

import type { StyleAttributes } from "./Attribute.js";

type Props = {
  styleAttributes?: StyleAttributes,
  name: string,
  icon: string,
  value: string,
  editing: boolean,
};

class TextAttribute extends Component<Props> {
  render() {
    const { styleAttributes, name, icon, value, editing } = this.props;
    if (editing) {
      return (
        <div className="form-group">
          <Icon name={icon} />
          <input type="text" name={name} defaultValue={value} />
        </div>
      );
    } else {
      return (
        <Attribute styleAttributes={styleAttributes} icon={icon} text={value} />
      );
    }
  }
}

export default TextAttribute;
