import React, { Component } from 'react';
import Card from './Card.js'
import Types from './Types.js'

import Authentication from './authentication.js';
import jQuery from 'jquery';
import { DropTarget } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

function move(cardId, columnId, pollFunction, hideFunction) {

    var params = {
        key: Authentication.TrelloKey,
        token: Authentication.TrelloToken,
        idList: columnId
    }
    hideFunction(cardId);
     jQuery.ajax({
            type: 'PUT',
            url: "https://api.trello.com/1/cards/"+cardId,
            data: params,
            success: function() {
                pollFunction();
            },
            error: function(xhr) {
                pollFunction();
                alert("Error moving card: "+xhr.responseText);
            }
        })
}
       

const columnTarget = {
    canDrop(props, monitor) {
        return true;
    },
    hover(props, monitor, component) {
        //unneeded?
    },
    drop(props, monitor, component) {
        const card = monitor.getItem();
        move(card.id, props.id, props.poll, props.hideCard);
    }

}

function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDropTarget: connect.dropTarget(),
    // You can ask the monitor about the current drag state:
    isOver: monitor.isOver(),
    isOverCurrent: monitor.isOver({ shallow: true }),
    canDrop: monitor.canDrop(),
    itemType: monitor.getItemType()
  };
}


class Column extends Component {

    constructor(props) {
        super();
        this.state = {
            classNames: "col " + props.title,
            newCard: []
        }
        this.addNewCard = this.addNewCard.bind(this);
        this.cancelNewCard = this.cancelNewCard.bind(this);
        this.archiveDone = this.archiveDone.bind(this);
    }

    addNewCard() {
        if(this.state.newCard.length == 0)
        {
            const blankCard = {
                title: "",
                labels: [],
                desc: "",
                due: null,
                poll: this.props.poll
            };
            this.setState({ newCard: [ blankCard ] });
        }
    }

    cancelNewCard() {
        this.setState({ newCard : [] });
    }

    archiveDone() {
        var self = this;
        if(window.confirm("Are you sure you want to archive all \"done\" cards?")) {
            var type = "POST";
            var url = "https://api.trello.com/1/lists/"+this.props.id+"/archiveAllCards";
            var params = {
                key: Authentication.TrelloKey,
                token: Authentication.TrelloToken
            }

            jQuery.ajax({
                type: type,
                url: url,
                data: params,
                success: function() {
                    self.props.poll();
                },
                error: function(xhr) {
                    alert("Error archiving cards: "+xhr.responseText);
                }
            })
        }        
    }
    
    render() {
        const { connectDropTarget, isOver } = this.props;
        return connectDropTarget(
            <div className={this.state.classNames}>
                <h2>
                    {this.props.title}
                    <input className="btn btn-primary new-button" type="button" value="+" onClick={this.addNewCard} />
                    {(this.props.title == "Done") ? <input className="btn btn-success new-button" type="button" value="&#x267B;" onClick={this.archiveDone} /> : ""}
                </h2>

                {this.state.newCard.map(card =>
                    <Card title={card.name}
                        subtitle={(card.labels[0]) ? card.labels[0].name : ""}
                        subtitleId={(card.labels[0] ? card.labels[0].id : "")}
                        description={card.desc}
                        due={card.due}
                        key={this.props.id}
                        listId={this.props.id}
                        poll={this.props.poll}
                        priority={this.props.prioirty}
                        isNew
                        cancelNewCard={this.cancelNewCard}
                    />
                )}
                
                {this.props.cards
                    .filter(card => card.idList === this.props.id )                 
                    .map(card => (
                    <Card title={card.name}
                        subtitle={(card.labels[0]) ? card.labels[0].name : ""}
                        subtitleId={(card.labels[0] ? card.labels[0].id : "")}
                        description={card.desc}
                        due={card.due}
                        key={card.id}
                        id={card.id}
                        poll={this.props.poll}
                        priority={this.props.prioirty}
                        hideCard={this.hideCard}
                    />
                ))}
               
            </div>    
        );
    }
}

export default DropTarget(Types.CARD, columnTarget, collect)(Column);