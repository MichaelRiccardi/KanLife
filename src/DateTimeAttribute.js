// @flow

import React, { Component } from "react";
import Moment from "moment";

import Attribute from "./Attribute.js";
import Icon from "./Icon.js";

import type { StyleAttributes } from "./Attribute.js";

type Props = {
  styleAttributes?: StyleAttributes,
  icon: string,
  dateTime: ?Moment,
  editing: boolean,
  onChange?: Function,
};

type State = {
  date: string,
  time: string,
};

class DateTimeAttribute extends Component<Props, State> {
  constructor(props: Props) {
    super();
    const { dateTime } = props;
    this.state = {
      date: dateTime ? dateTime.format("YYYY-MM-DD") : "",
      time: dateTime ? dateTime.format("HH:mm:00") : "",
    };
  }

  render() {
    const {
      styleAttributes,
      icon,
      dateTime,
      editing,
      onChange,
    } = this.props;
    const { date, time } = this.state;

    if (editing) {
      return (
        <div className="form-group">
          <Icon name={icon} />
          <input
            type="date"
            value={date}
            onChange={event => {
              this.setState({ date: event.target.value });
              onChange && onChange(event.target.value, time);
            }}
          />
          <input
            type="time"
            value={time}
            onChange={event => {
              this.setState({ time: event.target.value });
              onChange && onChange(date, event.target.value);
            }}
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
