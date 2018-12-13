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
  addingNewCard: boolean,
};

class Column extends Component<Props, State> {
  constructor(props: Props) {
    super();
    this.state = {
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
    const { title, id, dropCard, cards, poll, labels, deleteCard } = this.props;
    return (
      <div
        className={"col " + title}
        onDragOver={event => event.preventDefault()}
        onDrop={event => dropCard(event, id)}
      >
        <h2>
          {title}
          <input
            className="btn btn-primary new-button"
            type="button"
            value="+"
            onClick={this.toggleNewCard}
          />
          {title === "Done" && (
            <input
              className="btn btn-success new-button"
              type="button"
              value="&#x267B;"
              onClick={this.archiveDone}
            />
          )}
        </h2>
        {this.state.addingNewCard && (
          <Card
            title={""}
            label={null}
            description={""}
            due={null}
            id={id} // Pass Column ID for new card
            poll={poll}
            isNew={true}
            cancelNewCard={this.toggleNewCard}
            labels={labels}
          />
        )}
        {cards.map(card => (
          <Card
            title={card.name}
            label={card.labels[0]}
            description={card.desc}
            due={card.due}
            key={card.id}
            id={card.id || ""}
            poll={poll}
            isNew={false}
            deleteCard={deleteCard}
            labels={labels}
          />
        ))}
      </div>
    );
  }
}

export default Column;
