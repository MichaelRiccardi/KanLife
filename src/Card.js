// @flow

import React, { Component } from "react";
import Trello from "./Trello.js";
import Moment from "moment";
import Textarea from "react-textarea-autosize";
import jQuery from "jquery";
import ReactMarkdown from "react-markdown";

import DateTimeAttribute from "./DateTimeAttribute.js";
import EventAttribute from "./EventAttribute.js";
import Icon from "./Icon.js";
import Priority from "./Priority.js";
import TextAttribute from "./TextAttribute.js";

import type { LabelType } from "./App.js";

export type CardType = {
  name: string,
  id: ?string,
  idList: string, // columnId
  labels: Array<LabelType>,
  desc: string,
  due: string,
};

type Props = {
  id: string,
  title: string,
  label: ?LabelType,
  description: string,
  due: ?string,
  poll: Function,
  isNew: boolean,
  deleteCard?: Function,
  syncCard: Function,
  cancelNewCard?: Function,
  labels: Array<LabelType>,
};

export type CardDetailsType = {
  title: string,
  link: ?string,
  label: ?LabelType,
  priority: ?number,
  description: ?string,
  estimated: ?string,
  scheduledStart: ?Moment,
  scheduledEnd: ?Moment,
  due: ?Moment,
};

type State = {
  editing: boolean,
  saving: boolean,
  dragging: boolean,
  originalCard: ?CardDetailsType,
  // Card details -- TODO: Resolve flow issues with using ...CardDetailsType
  title: string,
  link: ?string,
  label: ?LabelType,
  priority: ?number,
  description: ?string,
  estimated: ?string,
  scheduledStart: ?Moment,
  scheduledEnd: ?Moment,
  due: ?Moment,
};

class Card extends Component<Props, State> {
  constructor(props: Props) {
    super();
    const { title, label, due, isNew } = props;
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
        link: null,
        priority: null,
        description: null,
        estimated: null,
        scheduledStart: null,
        scheduledEnd: null,
      };
    }
    this.state = {
      due: due ? Moment(due) : null,
      editing: isNew,
      saving: false,
      dragging: false,
      originalCard: null,
      title: title,
      label: label,
      ...details,
    };
  }

  edit = () => {
    this.setState((prevState: State) => {
      return {
        editing: true,
        originalCard: prevState,
      };
    });
  };

  saveCard = (e: Event) => {
    e.preventDefault();

    const { id, isNew, poll, cancelNewCard, syncCard } = this.props;
    const {
      description,
      scheduledStart,
      scheduledEnd,
      estimated,
      link,
      priority,
      title,
      label,
      due,
    } = this.state;

    const validatedLink = link && link.indexOf("http") === 0 ? link : null;

    this.setState({
      saving: isNew,
      editing: false,
      link: validatedLink,
    });

    jQuery.ajax({
      type: isNew ? "POST" : "PUT",
      url: "https://api.trello.com/1/cards" + (isNew ? "?idList=" : "/") + id,
      data: {
        key: Trello.Key,
        token: Trello.Token,
        idLabels: label ? label.id : null,
        name: title,
        desc: JSON.stringify({
          description: description,
          scheduledStart: scheduledStart,
          scheduledEnd: scheduledEnd,
          estimated: estimated,
          link: validatedLink,
          priority: priority,
        }),
        due: due ? due.toDate() : null,
      },
      success: async result => {
        syncCard(this.state, result.id);
        await poll();
        cancelNewCard && cancelNewCard();
      },
      error: xhr => {
        alert("Error saving your changes: " + xhr.responseText);
        console.log(xhr);
      },
    });
  };

  cancelEdit = () => {
    const { isNew, cancelNewCard } = this.props;
    const { originalCard } = this.state;

    if (isNew) {
      cancelNewCard && cancelNewCard();
    } else if (originalCard) {
      // Always true, but check to make Flow happy
      const {
        description,
        scheduledStart,
        scheduledEnd,
        estimated,
        link,
        priority,
        title,
        label,
        due,
      } = originalCard;
      this.setState({
        editing: false,
        description,
        scheduledStart,
        scheduledEnd,
        estimated,
        link,
        priority,
        title,
        label,
        due,
      });
    }
  };

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

  startDrag = (event: DragEvent): void => {
    event.dataTransfer && event.dataTransfer.setData("text", this.props.id);
    // Timeout hack allows original to be hidden without hiding the drag preview
    setTimeout(() => this.setState({ dragging: true }));
  };

  endDrag = (): void => {
    this.setState({ dragging: false });
  };

  render() {
    const { id, isNew, deleteCard, labels } = this.props;

    const {
      dragging,
      due,
      title,
      description,
      priority,
      estimated,
      link,
      scheduledStart,
      scheduledEnd,
      editing,
      saving,
      label,
    } = this.state;

    if (saving) {
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
    } else if (editing) {
      return (
        <form onSubmit={this.saveCard}>
          <div className="card card-outline-info">
            <div className="card-body">
              <h4 className="card-title">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={event =>
                    this.setState({ title: event.target.value })
                  }
                />
              </h4>

              <h6 className="card-subtitle mb-2 text-muted">
                <select
                  value={label ? label.id : ""}
                  onChange={event => {
                    const id = event.target.value;
                    this.setState({
                      label: {
                        name:
                          id !== ""
                            ? labels.filter(label => label.id === id)[0].name
                            : "",
                        id: id,
                      },
                    });
                  }}
                >
                  <option value="" />
                  {labels.map(label => (
                    <option value={label.id} key={label.id}>
                      {label.name}
                    </option>
                  ))}
                </select>
                <select
                  value={priority || "0"}
                  onChange={event => {
                    this.setState({ priority: event.target.value });
                  }}
                >
                  <option value="0" />
                  <option value="4">Blocker</option>
                  <option value="3">Critical</option>
                  <option value="2">Important</option>
                  <option value="1">Minor</option>
                </select>
              </h6>

              <p className="card-text">
                <input
                  type="text"
                  style={{ width: "100%" }}
                  placeholder="URL"
                  value={link || ""}
                  onChange={event => {
                    this.setState({ link: event.target.value });
                  }}
                />
                <Textarea
                  placeholder="Description"
                  value={description || ""}
                  onChange={event => {
                    this.setState({ description: event.target.value });
                  }}
                />
              </p>

              <TextAttribute
                icon="clock-o"
                value={estimated}
                editing={true}
                styleAttributes={{}}
                onChange={event => {
                  this.setState({ estimated: event.target.value });
                }}
              />

              <EventAttribute
                icon="calendar"
                start={scheduledStart}
                end={scheduledEnd}
                editing={true}
                styleAttributes={{}}
                onChange={(
                  date: string,
                  startTime: string,
                  endTime: string
                ) => {
                  if (date && startTime && endTime) {
                    const scheduledStart = Moment(date + " " + startTime);
                    let scheduledEnd = Moment(date + " " + endTime);
                    if (scheduledEnd.isBefore(scheduledStart)) {
                      scheduledEnd.add(1, "day"); // Allow overnight events
                    }
                    this.setState({ scheduledStart, scheduledEnd });
                  } else {
                    this.setState({ scheduledStart: null, scheduledEnd: null });
                  }
                }}
              />

              <DateTimeAttribute
                icon="inbox"
                dateTime={due}
                editing={true}
                styleAttributes={{}}
                onChange={(date: string, time: string) => {
                  this.setState({
                    due: date && time ? Moment(date + " " + time) : null,
                  });
                }}
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
              {!isNew && (
                <input
                  className="btn btn-basic"
                  type="button"
                  value="&#128465;"
                  onClick={() => deleteCard && deleteCard(id)}
                />
              )}
            </div>
          </div>
        </form>
      );
    } else {
      return (
        <div
          className="card card-outline-info"
          draggable="true"
          onDragStart={event => this.startDrag(event)}
          onDragEnd={this.endDrag}
        >
          {!dragging && (
            <div className="card-body">
              <h4 className="card-title">
                {link ? (
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {title}
                  </a>
                ) : (
                  <span>{title}</span>
                )}
                <span className="card-edit" onClick={this.edit}>
                  <Icon name="pencil" />
                </span>
                <span className="card-priority">
                  <Priority level={priority || 0} />
                </span>
              </h4>
              <h6 className="card-subtitle mb-2 text-muted">
                {label ? label.name : ""}
              </h6>
              <div className="card-text">
                <ReactMarkdown source={description || ""} />
              </div>
              <TextAttribute
                icon="clock-o"
                value={estimated || "TBD"}
                editing={false}
                styleAttributes={{
                  classNames: !estimated ? "tbd" : "",
                }}
              />
              <EventAttribute
                icon="calendar"
                start={scheduledStart}
                end={scheduledEnd}
                editing={false}
                styleAttributes={{
                  classNames: !scheduledStart
                    ? "tbd"
                    : Moment().isAfter(scheduledStart)
                    ? "past-scheduled"
                    : Moment().isSame(scheduledStart, "d")
                    ? "scheduled-today"
                    : "",
                }}
              />
              <br />
              <DateTimeAttribute
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
    }
  }
}

export default Card;
