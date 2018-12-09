// @flow

import React, { Component } from "react";
import Authentication from "./authentication.js";
import Moment from "moment";
import Textarea from "react-textarea-autosize";
import jQuery from "jquery";
import { DragSource } from "react-dnd";
import ReactMarkdown from "react-markdown";

import DateTimeAttribute from "./DateTimeAttribute.js";
import EventAttribute from "./EventAttribute.js";
import Icon from "./Icon.js";
import Priority from "./Priority.js";
import TextAttribute from "./TextAttribute.js";
import Types from "./Types.js";

import type LabelType from "./App.js";

const cardSource = {
  canDrag(props) {
    return true;
  },

  isDragging(props, monitor) {
    return monitor.getItem().id === props.id;
  },

  beginDrag(props, monitor, component) {
    const item = { id: props.id };
    return item;
  },

  endDrag(props, monitor, component) {
    if (monitor.didDrop()) {
      return;
    }
  },
};

function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  };
}

export type CardType = {
  name: string,
  id: ?string,
  labels: Array<LabelType>,
  desc: string,
  due: string,
};

type CardDetailType = {
  description: ?string,
  scheduledStart: ?Date,
  scheduledEnd: ?Date,
  estimated: ?string,
  link: ?string,
  priority: ?number,
};

type Props = {
  id: string,
  title: string,
  subtitle: string,
  subtitleId: string,
  description: string,
  due: Date,
  key: string,
  poll: Function,
  isNew: boolean,
  cancelNewCard: Function,
  labels: Array<LabelType>,
  isDragging: any,
  connectDragSource: any,
};

type State = {
  due: ?Moment,
  details: CardDetailType,
  editing: boolean,
  title: string,
  subtitle: string,
  saving: boolean,
  visible: boolean,
};

class Card extends Component<Props, State> {
  constructor(props) {
    super();
    let details = null;
    try {
      details = JSON.parse(props.description);
      details.scheduledStart = details.scheduledStart
        ? Moment(details.scheduledStart)
        : null;
      details.scheduledEnd = details.scheduledEnd
        ? Moment(details.scheduledEnd)
        : null;
    } catch {
      details = {
        description: null,
        scheduledStart: null,
        scheduledEnd: null,
        estimated: null,
        link: null,
        priority: null,
      };
    }
    this.state = {
      due: props.due != null ? Moment(props.due) : null,
      details: details,
      editing: props.isNew ? true : false,
      title: props.title,
      subtitle: props.subtitle,
      saving: false,
      visible: true,
    };
    this.edit = this.edit.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.updateCard = this.updateCard.bind(this);
    this.delete = this.delete.bind(this);
  }

  edit = () => {
    this.setState({ editing: true });
  };

  getField = (form: HTMLFormElement, field: string) => {
    return form[field] instanceof HTMLInputElement ||
      form[field] instanceof HTMLSelectElement ||
      form[field] instanceof HTMLTextAreaElement
      ? form[field].value
      : "";
  };

  updateCard = (e: Event) => {
    e.preventDefault();

    var self = this;

    var form = document.forms["edit-" + this.props.id];
    var utcOffset = new Date().getTimezoneOffset() / 60;

    var scheduledDate = this.getField(form, "scheduledDate");
    var scheduledTimeStart = this.getField(form, "scheduledTimeStart");
    var scheduledTimeEnd = this.getField(form, "scheduledTimeEnd");
    var estimatedField = this.getField(form, "estimated");
    var dueDate = this.getField(form, "dueDate");
    var dueTime = this.getField(form, "dueTime");
    var linkField = this.getField(form, "link");
    var priorityField = this.getField(form, "priority");
    var label = this.getField(form, "label");
    var name = this.getField(form, "name");
    var desc = this.getField(form, "desc");

    let detailScheduledStart = null;
    let detailScheduledEnd = null;

    if (
      scheduledDate !== "" && //"2017-08-27"
      scheduledTimeStart !== "" &&
      scheduledTimeEnd !== ""
    ) {
      var start = Moment(scheduledDate + " " + scheduledTimeStart).add(
        utcOffset,
        "hours"
      );
      var end = Moment(scheduledDate + " " + scheduledTimeEnd).add(
        utcOffset,
        "hours"
      );

      detailScheduledStart = Moment(start).format("YYYY-MM-DDTHH:mm:00[Z]");
      detailScheduledEnd = Moment(end).format("YYYY-MM-DDTHH:mm:00[Z]");
    }

    var due = null;

    if (dueDate !== "" && dueTime !== "") {
      due = Moment(dueDate + " " + dueTime);
    }

    const details = {
      description: desc,
      scheduledStart: detailScheduledStart,
      scheduledEnd: detailScheduledEnd,
      estimated:
        estimatedField !== "" && estimatedField !== "TBD"
          ? estimatedField
          : null,
      link: linkField.indexOf("http") === 0 ? linkField : null,
      priority: priorityField !== "0" ? parseInt(priorityField) : null,
    };

    var params = {
      key: Authentication.TrelloKey,
      token: Authentication.TrelloToken,
      idLabels: label,
      name: name,
      desc: JSON.stringify(details),
      due: due ? due.toDate() : null,
    };

    var url;
    var type;

    if (this.props.isNew) {
      type = "POST";
      url = "https://api.trello.com/1/cards?idList=" + this.props.id;
    } else {
      type = "PUT";
      url = "https://api.trello.com/1/cards/" + this.props.id;
    }

    this.setState({ saving: true });

    jQuery.ajax({
      type: type,
      url: url,
      data: params,
      success: function() {
        self.props.poll();
        self.setState({ editing: false });
        if (self.props.isNew) {
          self.props.cancelNewCard();
        }
      },
      error: function(xhr) {
        self.setState({ saving: false });
        alert("Error saving your changes: " + xhr.responseText);
        console.log(xhr);
      },
    });
  };

  cancelEdit = () => {
    if (this.props.isNew) {
      this.props.cancelNewCard();
    } else {
      this.setState({ editing: false });
    }
  };

  delete = () => {
    var self = this;
    if (window.confirm("Are you sure you want to delete this card?")) {
      var params = {
        key: Authentication.TrelloKey,
        token: Authentication.TrelloToken,
      };
      self.setState({ saving: true });
      jQuery.ajax({
        type: "DELETE",
        url: "https://api.trello.com/1/cards/" + this.props.id,
        data: params,
        success: function() {
          self.props.poll();
        },
        error: function(xhr) {
          self.setState({ saving: false });
          alert("Error deleting card: " + xhr.responseText);
          console.log(xhr);
        },
      });
    }
  };

  moveTo(id) {
    alert("card " + this.props.id + " move to " + id);
  }

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

  render() {
    const { isDragging, connectDragSource } = this.props;
    const { details } = this.state;

    const due = this.props.due ? Moment(this.props.due) : null;

    const descriptionText = details.description || "";
    const priority = details.priority || 0;
    const estimatedText = details.estimated || "TBD";
    const linkText = details.link || "";

    if (this.state.saving) {
      return (
        <div className="card card-outline-info">
          <div className="card-body centered">
            <h4 className="card-title">
              <Icon name="circle-o-notch fa-pulse fa-fw" />
              &nbsp;Saving...
            </h4>
          </div>
        </div>
      );
    } else if (this.state.editing) {
      return (
        <form id={"edit-" + this.props.id} onSubmit={this.updateCard}>
          <div className="card card-outline-info">
            <div className="card-body">
              <h4 className="card-title">
                <input
                  name="name"
                  type="text"
                  placeholder="Title"
                  defaultValue={this.state.title}
                />
              </h4>

              <h6 className="card-subtitle mb-2 text-muted">
                <select name="label" defaultValue={this.props.subtitleId}>
                  <option value="" />
                  {this.props.labels.map(label => (
                    <option value={label.id} key={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
                <select name="priority" defaultValue={priority}>
                  <option value="0" />
                  <option value="4">Blocker</option>
                  <option value="3">Critical</option>
                  <option value="2">Important</option>
                  <option value="1">Minor</option>
                </select>
              </h6>

              <p className="card-text">
                <input
                  name="link"
                  type="text"
                  style={{ width: "100%" }}
                  placeholder="URL"
                  defaultValue={linkText}
                />
                <Textarea
                  name="desc"
                  placeholder="Description"
                  defaultValue={descriptionText}
                />
              </p>

              <TextAttribute
                name="estimated"
                icon="clock-o"
                value={estimatedText}
                editing={true}
                styleAttributes={{
                  classNames: estimatedText === "TBD" ? "tbd" : "",
                }}
              />

              <EventAttribute
                name="scheduled"
                icon="calendar"
                start={details.scheduledStart}
                end={details.scheduledEnd}
                editing={true}
                styleAttributes={{}}
              />

              <DateTimeAttribute
                name="due"
                icon="inbox"
                dateTime={due}
                editing={true}
                styleAttributes={{}}
              />

              <br />
              <input
                className="btn btn-success"
                type="submit"
                value="&#10004;"
              />
              <input
                className="btn btn-danger"
                type="button"
                value="X"
                onClick={this.cancelEdit}
              />
              {!this.props.isNew && (
                <input
                  className="btn btn-basic"
                  type="button"
                  value="&#128465;"
                  onClick={this.delete}
                />
              )}
            </div>
          </div>
        </form>
      );
    } else if (this.state.visible) {
      return connectDragSource(
        <div className="card card-outline-info">
          {!isDragging && (
            <div className="card-body">
              <h4 className="card-title">
                {details && details.link && (
                  <a
                    href={details.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {this.state.title}
                  </a>
                )}
                {(!details || !details.link) && <span>{this.state.title}</span>}
                <span className="card-edit" onClick={this.edit}>
                  <Icon name="pencil" />
                </span>
                <span className="card-priority">
                  <Priority level={priority} />
                </span>
              </h4>
              <h6 className="card-subtitle mb-2 text-muted">
                {this.state.subtitle}
              </h6>
              <div className="card-text">
                <ReactMarkdown source={descriptionText} />
              </div>
              <TextAttribute
                name="estimated"
                icon="clock-o"
                value={estimatedText}
                editing={false}
                styleAttributes={{
                  classNames: estimatedText === "TBD" ? "tbd" : "",
                }}
              />
              <EventAttribute
                name="scheduled"
                icon="calendar"
                start={details.scheduledStart}
                end={details.scheduledEnd}
                editing={false}
                styleAttributes={{
                  classNames: !details.scheduledStart
                    ? "tbd"
                    : Moment().isAfter(details.scheduledStart)
                    ? "past-scheduled"
                    : Moment().isSame(details.scheduledStart, "d")
                    ? "scheduled-today"
                    : "",
                }}
              />
              <br />
              <DateTimeAttribute
                name="due"
                icon="inbox"
                dateTime={due}
                editing={false}
                styleAttributes={
                  !due
                    ? { classNames: "tbd" }
                    : Moment().isAfter(due)
                    ? { classNames: "past-due" }
                    : due.isBefore(Moment().add(24, "hours"))
                    ? { classNames: "due-24-hours" }
                    : due.isBefore(Moment().add(1, "week"))
                    ? {
                        classNames: "due-this-week",
                        customStyle: {
                          backgroundColor: this.pickFromGradient(
                            [0xff, 0xff, 0x00],
                            [0x00, 0xff, 0x00],
                            (due.diff(Moment(), "hours") - 24) / (6 * 24)
                          ),
                        },
                      }
                    : {}
                }
              />
            </div>
          )}
        </div>
      );
    } else {
      return <div />;
    }
  }
}

export default DragSource(Types.CARD, cardSource, collect)(Card);
