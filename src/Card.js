import React, { Component } from 'react';
import Authentication from './authentication.js';
import Moment from 'moment';
import Textarea from 'react-textarea-autosize';
import jQuery from 'jquery';
import { DragSource } from 'react-dnd';
import ReactMarkdown from 'react-markdown';

import Icon from './Icon.js';
import Priority from './Priority.js';
import Stat from './Stat.js';
import Types from './Types.js';

const cardSource = {
	canDrag(props) {
		return true;
	},

	isDragging(props, monitor) {
		return monitor.getItem().id === props.id;
	},

	beginDrag(props, monitor, component) {
		//alert('potato');
		const item = { id: props.id };
		return item;
	},

	endDrag(props, monitor, component) {
		if(monitor.didDrop()) {
			return;
		}

		//alert('not dropped anywhere');
		//const item = monitor.getItem();
		//const dropResult = monitor.getDropResult();
	}
}

function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		isDragging: monitor.isDragging()
	}
}

class Card extends Component {

	constructor(props) {
		super();
		this.state = {
	        cycle: Math.floor(Math.random()*60)+"min",
	        due: props.due,
	        duePretty: (props.due) ? Moment(props.due).format("ddd M/D h:mma") : "TBD",
	        estimated: (props.description.indexOf("{est=") > -1) ?
	            props.description.substring( props.description.indexOf("{est=") + 5, props.description.indexOf("=est}") ) : "TBD",
	        scheduled: (props.description.indexOf("{sch=") > -1) ?
	            Moment(
	                props.description.substring( props.description.indexOf("{sch=") + 5,  props.description.indexOf("{sch=") + 5 + 20 ))
	                .format("ddd M/D h:mma") : "TBD",
	        scheduledDate: Moment(
	                props.description.substring( props.description.indexOf("{sch=") + 5,  props.description.indexOf("{sch=") + 5 + 20 )),
	        scheduledStart: (props.description.indexOf("{sch=") > -1) ?
	            Moment(props.description.substring( props.description.indexOf("{sch=") + 5,  props.description.indexOf("{sch=") + 5 + 20 ))
	                : null,
			scheduledEnd: (props.description.indexOf("=sch}") > -1) ?
	            Moment(props.description.substring( props.description.indexOf("=sch}") - 20,  props.description.indexOf("=sch}") ))
	                : null,
	        description: (props.description) ? props.description.replace(/\{[^}]+\}/g, '').replace(/(^[ \t]*\n)/gm, "") : "",
	        editing: (props.isNew) ? true : false,
	        title: props.title,
	        subtitle: props.subtitle,
	        link: (props.description.indexOf("{url=") > -1) ?
	            props.description.substring( props.description.indexOf("{url=") + 5, props.description.indexOf("=url}") ) : null,
	        priority: (props.description.indexOf("{pri=") > -1) ?
	        	props.description.substring( props.description.indexOf("{pri=") + 5, props.description.indexOf("=pri}") ) : 0,
	        saving: false,
	        visible: true
    	}
	    this.edit = this.edit.bind(this);
	    this.cancelEdit = this.cancelEdit.bind(this);
	    this.updateCard = this.updateCard.bind(this);
	    this.delete = this.delete.bind(this);
	}

    edit() {
    	this.setState({editing: true});
    }

    updateCard(e) {
    	e.preventDefault();

    	var self = this;

    	var form = document.forms["edit-"+this.props.id];
    	var utcOffset = (new Date().getTimezoneOffset() / 60);

    	var scheduled = "";
    	var estimated = "";
    	var link = "";
    	var priority = "";

    	if(form.scheduledDate.value !== "" && //"2017-08-27"
			form.scheduledTimeStart.value !== "" &&
			form.scheduledTimeEnd.value !== "") {

    		var start = Moment(form.scheduledDate.value+" "+form.scheduledTimeStart.value).add(utcOffset, 'hours');
    		var end = Moment(form.scheduledDate.value+" "+form.scheduledTimeEnd.value).add(utcOffset, 'hours');

    		scheduled = "\n{sch=" + Moment(start).format("YYYY-MM-DDTHH:mm:00[Z]") + "|" + Moment(end).format("YYYY-MM-DDTHH:mm:00[Z]") + "=sch}";
    	}

    	if(form.estimated.value !== "" && form.estimated.value !== "TBD") {
    		estimated = "\n{est=" + form.estimated.value + "=est}";
    	}

    	var due = null;
    
		if(form.dueDate.value !== "" &&
			form.dueTime.value !== "") {

    		due = Moment(form.dueDate.value+" "+form.dueTime.value);//.add(utcOffset, 'hours');
    		//due = Moment(due).format("YYYY-MM-DDTHH:mm:00[Z]");
    	}

    	if(form.link.value.indexOf("http") === 0) {
    		link = "\n{url=" + form.link.value + "=url}";
    	}

    	if(form.priority.value != "0") {
    		priority = "\n{pri=" + form.priority.value + "=pri}";
    	}

    	var params = {
    		key: Authentication.TrelloKey,
    		token: Authentication.TrelloToken,
    		idLabels: form.label.value,
    		name: form.name.value,
    		desc: form.desc.value + scheduled + estimated + link + priority,
    		due: (due) ? due.toDate() : null
    	}

    	var url;
    	var type;

    	if (this.props.isNew) {
    		type = "POST";
    		url = "https://api.trello.com/1/cards?idList=" + this.props.listId;
    	}
    	else {
    		type = "PUT";
    		url = "https://api.trello.com/1/cards/"+this.props.id; 
    	}

    	this.setState({saving: true});

    	jQuery.ajax({
    		type: type,
    		url: url,
    		data: params,
    		success: function() {
				self.props.poll();
    			self.setState({editing: false});
    			if(self.props.isNew) {
    				self.props.cancelNewCard();
    			}
    		},
    		error: function(xhr) {
    			this.setState({saving: false});
    			alert("Error saving your changes: "+xhr.responseText);
    			console.log(xhr);
    		}
    	})
    }

    cancelEdit() {
    	if(this.props.isNew) {
    		this.props.cancelNewCard();
    	}
    	else {
    		this.setState({editing: false});	
    	}
    }

    delete() {
    	var self = this;
    	if(window.confirm("Are you sure you want to delete this card?")) {
    		var params = {
    			key: Authentication.TrelloKey,
    			token: Authentication.TrelloToken,
    		};
    		self.setState({saving: true});
	    	jQuery.ajax({
	    		type: "DELETE",
	    		url: "https://api.trello.com/1/cards/"+this.props.id,
	    		data: params,
	    		success: function() {
	    			self.props.poll();
	    		},
	    		error: function(xhr) {
	    			self.setState({saving: false});
	    			alert("Error deleting card: "+xhr.responseText);
	    			console.log(xhr);
	    		}
	    	})
    	}
    }

    moveTo(id) {
    	alert("card "+this.props.id+ " move to " + id);
    }

    render() {

    	const { isDragging, connectDragSource } = this.props;

    	if(this.state.saving)
    	{
    		return (
				<div className="card card-outline-info"> 
	              	<div className="card-block centered">
	              		<h4 className="card-title">
	                		<Icon name="circle-o-notch fa-pulse fa-fw" />
	                		&nbsp;Saving...
	                	</h4>
	              	</div>
	            </div>
    		);
    	}
    	else if(this.state.editing)
    	{
    		return ( 

    			<form id={"edit-"+this.props.id} onSubmit={this.updateCard}>
	    			<div className="card card-outline-info"> 
		              <div className="card-block">

		                <h4 className="card-title">
		                    <input name="name" type="text" placeholder="Title" defaultValue={this.state.title} />
		                </h4>

		                <h6 className="card-subtitle mb-2 text-muted">
		                    <select name="label" defaultValue={this.props.subtitleId}>
		                    	<option value=""></option>
		                    	{this.props.labels.map(label => 
		                    		<option value={label.id}>{label.name}</option>
		                    	)}             	
	                    	</select>
	                    	<select name="priority" defaultValue={this.state.priority}>
	                    		<option value="0"></option>
	                    		<option value="4">Blocker</option>
	                    		<option value="3">Critical</option>
	                    		<option value="2">Important</option>
	                    		<option value="1">Minor</option>
	                    	</select>
		                </h6>

		                <p className="card-text">
		                	<input name="link" type="text" style={{width: '100%'}} placeholder="URL" defaultValue={this.state.link} />
		                    <Textarea name="desc" placeholder="Description" defaultValue={this.state.description} />
		                </p>

		                <Stat icon="clock-o" type="text" value={this.state.estimated} editing />
		                <Stat icon="calendar" type="event" value={this.state.scheduled} scheduledStart={this.state.scheduledStart} scheduledEnd={this.state.scheduledEnd} editing />
		                  {/*<Stat icon="refresh" value={this.state.cycle}*/}
		                <Stat icon="inbox" type="date-time" value={this.state.duePretty} due={this.state.due} editing />
		                
		                <input className="btn btn-success" type="submit" value="&#10004;" />
		                <input className="btn btn-danger" type="button" value="X" onClick={this.cancelEdit} />
		                {this.props.isNew || <input className="btn btn-basic" type="button" value="&#128465;" onClick={this.delete} />}

		              </div>
		            </div>
		        </form>

	       );
    	}
    	else if(this.state.visible)
    	{
	        return connectDragSource(
	            <div className="card card-outline-info"> 
	        	{!isDragging && (
	            
	              <div className="card-block">

	                <h4 className="card-title">
	                	{this.state.link && (<a href={this.state.link} target="_blank">{this.state.title}</a>)}
	                    {!this.state.link && (<span>{this.state.title}</span>)}
	                    <span className="card-edit" onClick={this.edit}>
	                        <Icon name="pencil" />
	                    </span>
	                    <span className="card-priority">
	                    	<Priority level={this.state.priority} />
	                    </span>
	                </h4>

	                <h6 className="card-subtitle mb-2 text-muted">
	                    {this.state.subtitle}
	                </h6>

	                <p className="card-text">
	                    <ReactMarkdown source={this.state.description} />
	                </p>

	                <Stat icon="clock-o" value={this.state.estimated} />
	                <Stat icon="calendar" value={this.state.scheduled} scheduled={this.state.scheduledDate} /><br />
	                  {/*<Stat icon="refresh" value={this.state.cycle}*/}
	                <Stat icon="inbox" value={this.state.duePretty} due={this.state.due} />

	              </div>
	            

	            )}
	            </div>

	        );
	    }
	    else 
	    {
	    	return <div></div>;
	    }
    }

}

export default DragSource(Types.CARD, cardSource, collect)(Card);