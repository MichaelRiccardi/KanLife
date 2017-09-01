import React, { Component } from 'react';
import Card from './Card.js'

class Column extends Component {
            
    state = {
        classNames: "col " + this.props.title
    }
    
    render() {
        return (
            <div className={this.state.classNames}>
                <h2>{this.props.title}</h2>
                
                {this.props.cards
                    .filter(card => card.idList === this.props.id )                 
                    .map(card => (
                    <Card title={card.name}
                        subtitle={(card.labels[0]) ? card.labels[0].name : ""}
                        description={card.desc}
                        due={card.due}
                        key={card.id}
                        id={card.id}
                        poll={this.props.poll}
                    />
                ))}
               
            </div>    
        );
    }
}

export default Column;