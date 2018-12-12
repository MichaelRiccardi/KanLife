// @flow

import React, { Component } from "react";
import Card from "./Card.js";

import Trello from "./Trello.js";
import jQuery from "jquery";

import type { CardType } from "./Card.js";

export type ColumnType = {
  name: string,
  id: string,
};

type Props = {
  title: string,
  poll: Function,
  id: string,
  labels: Array<Object>,
  cards: Array<CardType>,
  dropCard: Function,
  deleteCard: Function,
};

type State = {
  classNames: string,
  addingNewCard: boolean,
};

class Column extends Component<Props, State> {
  constructor(props: Props) {
    super();
    this.state = {
      classNames: "col " + props.title,
      addingNewCard: false,
    };
  }

  toggleNewCard = () => {
    this.setState(prevState => ({ addingNewCard: !prevState.addingNewCard }));
  };

  archiveDone = () => {
    const { id, poll } = this.props;
    if (window.confirm('Are you sure you want to archive all "done" cards?')) {
      jQuery.ajax({
        type: "POST",
        url: "https://api.trello.com/1/lists/" + id + "/archiveAllCards",
        data: {
          key: Trello.Key,
          token: Trello.Token,
        },
        success: () => {
          poll();
        },
        error: xhr => {
          alert("Error archiving cards: " + xhr.responseText);
        },
      });
    }
  };

  render() {
    return (
      <div
        className={this.state.classNames}
        onDragOver={event => {
          event.preventDefault();
        }}
        onDrop={event => {
          this.props.dropCard(event, this.props.id);
        }}
      >
        <h2>
          {this.props.title}
          <input
            className="btn btn-primary new-button"
            type="button"
            value="+"
            onClick={this.toggleNewCard}
          />
          {this.props.title === "Done" ? (
            <input
              className="btn btn-success new-button"
              type="button"
              value="&#x267B;"
              onClick={this.archiveDone}
            />
          ) : (
            ""
          )}
        </h2>

        {this.state.addingNewCard && (
          <Card
            title={""}
            subtitle={""}
            subtitleId={""}
            description={""}
            due={null}
            id={this.props.id} // Pass Column ID for new card
            poll={this.props.poll}
            isNew={true}
            cancelNewCard={this.toggleNewCard}
            labels={this.props.labels}
          />
        )}

        {this.props.cards.map(card => (
          <Card
            title={card.name}
            subtitle={card.labels[0] ? card.labels[0].name : ""}
            subtitleId={card.labels[0] ? card.labels[0].id : ""}
            description={card.desc}
            due={card.due}
            key={card.id}
            id={card.id || ""}
            poll={this.props.poll}
            deleteCard={this.props.deleteCard}
            labels={this.props.labels}
          />
        ))}
      </div>
    );
  }
}

export default Column;
