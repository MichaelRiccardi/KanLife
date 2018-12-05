// @flow

import React, { Component } from "react";
import Moment from "moment";

import Icon from "./Icon.js";

type Props = {
  value: string,
  due?: ?Moment,
  type?: string,
  scheduled?: ?Date,
  editing?: ?boolean,
  icon: string,
  value: string,
  scheduledStart?: ?Moment,
  scheduledEnd?: ?Moment,
};

type StyleAttributes = {
  classNames?: string,
  customStyle?: Object,
};

class Stat extends Component<Props> {
  pickFromGradient = (
    startColor: Array<number>,
    endColor: Array<number>,
    fraction: number
  ): string => {
    var result = [];
    for (var i = 0; i < 3; i++) {
      result[i] = Math.round(
        startColor[i] + (endColor[i] - startColor[i]) * fraction
      );
    }
    return "rgb(" + result.join(",") + ")";
  };

  getStyle = (): StyleAttributes => {
    const { due } = this.props;
    const now = Moment(new Date());

    let classNames = ["card-link", "highlight"];
    let customStyle = {};

    if (this.props.value === "TBD") {
      classNames.push("tbd");
    } else if (due != null) {
      if (now.isAfter(due)) {
        classNames.push("past-due");
      } else if (due.isBefore(now.add(24, "hours"))) {
        classNames.push("due-24-hours");
      } else if (due.isBefore(now.add(1, "week"))) {
        customStyle = {
          backgroundColor: this.pickFromGradient(
            [0xff, 0xff, 0x00],
            [0x00, 0xff, 0x00],
            (due.diff(now, "hours") - 24) / (6 * 24)
          ),
        };
        classNames.push("due-this-week");
      }
    } else if (this.props.scheduled != null) {
      if (now.isAfter(this.props.scheduled)) {
        classNames.push("past-scheduled");
      } else if (now.isSame(this.props.scheduled, "d")) {
        classNames.push("scheduled-today");
      }
    }

    return {
      classNames: classNames.join(" "),
      customStyle: customStyle,
    };
  };

  render() {
    if (this.props.editing) {
      switch (this.props.type) {
        case "text":
          return (
            <div className="form-group">
              <Icon name={this.props.icon} />
              <input
                type="text"
                name="estimated"
                defaultValue={this.props.value}
              />
            </div>
          );

        case "date-time":
          var date = this.props.due
            ? Moment(this.props.due).format("YYYY-MM-DD")
            : "";
          var time = this.props.due
            ? Moment(this.props.due).format("HH:mm:") + "00"
            : "";

          return (
            <div className="form-group">
              <Icon name={this.props.icon} />
              <input type="date" name="dueDate" defaultValue={date} />
              <input type="time" name="dueTime" defaultValue={time} />
            </div>
          );

        case "event":
          var scheduledDate =
            this.props.scheduledStart != null
              ? this.props.scheduledStart.format("YYYY-MM-DD")
              : null;
          var start =
            this.props.scheduledStart != null
              ? this.props.scheduledStart.format("HH:mm:00")
              : null;
          var end =
            this.props.scheduledEnd != null
              ? this.props.scheduledEnd.format("HH:mm:00")
              : null;

          return (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <Icon name={this.props.icon} />
                <input
                  type="date"
                  name="scheduledDate"
                  defaultValue={scheduledDate}
                />
              </div>
              <div className="form-group">
                from{" "}
                <input
                  type="time"
                  name="scheduledTimeStart"
                  defaultValue={start}
                />
                to{" "}
                <input type="time" name="scheduledTimeEnd" defaultValue={end} />
              </div>
            </>
          );

        default:
          return <div className="form-group">Invalid type!</div>;
      }
    } else {
      const styleAttributes = this.getStyle();
      return (
        <span
          className={styleAttributes.classNames || ""}
          style={styleAttributes.customStyle || {}}
        >
          <Icon name={this.props.icon} />
          {this.props.value}
        </span>
      );
    }
  }
}

export default Stat;
