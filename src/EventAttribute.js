// @flow

import React, { Component } from "react";
import Moment from "moment";

import Attribute from "./Attribute.js";
import Icon from "./Icon.js";

import type { StyleAttributes } from "./Attribute.js";

type Props = {
  styleAttributes?: StyleAttributes,
  icon: string,
  start: ?Moment,
  end: ?Moment,
  editing: boolean,
  onChange?: Function,
};

type State = {
  date: string,
  startTime: string,
  endTime: string,
};

class EventAttribute extends Component<Props, State> {
  constructor(props: Props) {
    super();
    const { start, end } = props;
    this.state = {
      date: start ? start.format("YYYY-MM-DD") : "",
      startTime: start ? start.format("HH:mm:00") : "",
      endTime: end ? end.format("HH:mm:00") : "",
    };
  }
  render() {
    const {
      styleAttributes,
      icon,
      start,
      editing,
      onChange,
    } = this.props;
    const { date, startTime, endTime } = this.state;

    if (editing) {
      return (
        <>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <Icon name={icon} />
            <input
              type="date"
              value={date}
              onChange={event => {
                this.setState({ date: event.target.value });
                onChange && onChange(event.target.value, startTime, endTime);
              }}
            />
          </div>
          <div className="form-group">
            from&nbsp;
            <input
              type="time"
              value={startTime}
              onChange={event => {
                this.setState({ startTime: event.target.value });
                onChange && onChange(date, event.target.value, endTime);
              }}
            />
            &nbsp;to&nbsp;
            <input
              type="time"
              value={endTime}
              onChange={event => {
                this.setState({ endTime: event.target.value });
                onChange && onChange(date, startTime, event.target.value);
              }}
            />
          </div>
        </>
      );
    } else {
      return (
        <Attribute
          styleAttributes={styleAttributes}
          icon={icon}
          text={start ? start.format("ddd M/D h:mma") : "TBD"}
        />
      );
    }
  }
}

export default EventAttribute;
