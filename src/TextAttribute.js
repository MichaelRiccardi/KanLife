// @flow

import React, { Component } from "react";

import Attribute from "./Attribute.js";
import Icon from "./Icon.js";

import type { StyleAttributes } from "./Attribute.js";

type Props = {
  styleAttributes?: StyleAttributes,
  onChange?: Function,
  icon: string,
  value: ?string,
  editing: boolean,
};

class TextAttribute extends Component<Props> {
  render() {
    const {
      styleAttributes,
      icon,
      value,
      editing,
      onChange,
    } = this.props;
    if (editing) {
      return (
        <div className="form-group">
          <Icon name={icon} />
          <input
            type="text"
            defaultValue={value}
            onChange={event => {
              onChange && onChange(event)
            }}
          />
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
