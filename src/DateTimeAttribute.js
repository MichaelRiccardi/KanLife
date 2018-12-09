// @flow

import React, { Component } from "react";
import Moment from "moment";

import Attribute from "./Attribute.js";
import Icon from "./Icon.js";

import type { StyleAttributes } from "./Attribute.js";

type Props = {
  styleAttributes?: StyleAttributes,
  name: string,
  icon: string,
  dateTime: ?Moment,
  editing: boolean,
};

class DateTimeAttribute extends Component<Props> {
  render() {
    const { styleAttributes, name, icon, dateTime, editing } = this.props;

    if (editing) {
      return (
        <div className="form-group">
          <Icon name={icon} />
          <input
            type="date"
            name={name + "Date"}
            defaultValue={dateTime ? dateTime.format("YYYY-MM-DD") : null}
          />
          <input
            type="time"
            name={name + "Time"}
            defaultValue={dateTime ? dateTime.format("HH:mm:00") : null}
          />
        </div>
      );
    } else {
      return (
        <Attribute
          styleAttributes={styleAttributes}
          icon={icon}
          text={dateTime ? dateTime.format("ddd M/D h:mma") : "TBD"}
        />
      );
    }
  }
}

export default DateTimeAttribute;
