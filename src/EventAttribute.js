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
  start: ?Moment,
  end: ?Moment,
  editing: boolean,
};

class EventAttribute extends Component<Props> {
  render() {
    const { styleAttributes, name, icon, start, end, editing } = this.props;

    if (editing) {
      return (
        <>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <Icon name={icon} />
            <input
              type="date"
              name={name + "Date"}
              defaultValue={start ? start.format("YYYY-MM-DD") : null}
            />
          </div>
          <div className="form-group">
            from&nbsp;
            <input
              type="time"
              name={name + "TimeStart"}
              defaultValue={start ? start.format("HH:mm:00") : null}
            />
            &nbsp;to&nbsp;
            <input
              type="time"
              name={name + "TimeEnd"}
              defaultValue={end ? end.format("HH:mm:00") : null}
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
