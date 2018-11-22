// @flow

import React, { Component } from 'react';
import Moment from 'moment';

import Icon from './Icon.js';

type Props = {
    value: string,
    due?: ?string,
    type?: string,
    scheduled?: ?Date,
    editing?: ?boolean,
    icon: string,
    value: string,
    scheduledStart?: ?any, // Moment
    scheduledEnd?: ?any, // Moment
}

type State = {
    classNames: string,
    color: string,
}

class Stat extends Component<Props, State> {

    constructor() {
        super();
        this.state = {
            classNames: "card-link",
            color: "",
        };
    }

    pickFromGradient = (startColor: Array<number>, endColor: Array<number>, fraction: number) => {
        var result = [];
        for(var i=0;i<3;i++) {
            result[i] = Math.round(startColor[i] + (endColor[i] - startColor[i]) * fraction);
        }
        this.setState({color: "rgb(" + result.join(",") + ")"});
    }

    componentDidMount() {
        if(this.props.value === "TBD")
        {
            this.setState({classNames: "card-link highlight tbd"});
        }
        else if(this.props.due != null)
        {
            if(Moment(new Date()).isAfter(this.props.due))
            {
                this.setState({classNames: "card-link highlight past-due"});
            }
            else if(Moment(new Date()).add(24, 'hours').isAfter(this.props.due))
            {
                this.setState({classNames: "card-link highlight due-24-hours"});
            }
            else if(Moment(new Date()).add(7, 'days').isAfter(this.props.due))
            {
                var fraction = (Moment(this.props.due).diff(Moment(new Date()), 'hours') - 24) / (6*24);
                this.pickFromGradient([0xFF, 0xFF, 0x00], [0x00, 0xFF, 0x00], fraction);
                this.setState({classNames: "card-link highlight due-this-week"});
            }
        }
        if(this.props.scheduled != null)
        {
            if(Moment(new Date()).isAfter(this.props.scheduled))
            {
                this.setState({classNames: "card-link highlight past-scheduled"});
            }
            else if(Moment(new Date()).isSame(this.props.scheduled,'d'))
            {
                this.setState({classNames: "card-link highlight blue"})
            }
        }
    }

    render() {
    	if(this.props.editing) {

    		var editField;

    		switch(this.props.type)
    		{
    			case 'text':
    				editField = <span>
    								<input type="text" name="estimated" defaultValue={this.props.value} />
    								<br />
    							</span>
				break;

    			case 'date-time':
    				var date = (this.props.due) ? Moment(this.props.due).format('YYYY-MM-DD') : "";
    				var time = (this.props.due) ? Moment(this.props.due).format('HH:mm:') + "00" : "";

    				editField = <span>
    								<input type="date" name="dueDate" defaultValue={date}  />
    								<input type="time" name="dueTime" defaultValue={time} />
    								<br /><br />
    							</span>
    			break;

    			case 'event':
    				var scheduledDate = (this.props.scheduledStart != null) ? this.props.scheduledStart.format("YYYY-MM-DD") : null;
    				var start = (this.props.scheduledStart != null) ? this.props.scheduledStart.format("HH:mm:00") : null;
    				var end = (this.props.scheduledEnd != null) ? this.props.scheduledEnd.format("HH:mm:00") : null;

    				editField = <span>
    								<input type="date" name="scheduledDate" defaultValue={scheduledDate} /><br />
    								from <input type="time" name="scheduledTimeStart" defaultValue={start} />
    								to <input type="time" name="scheduledTimeEnd" defaultValue={end} />
								</span>
    			break;

    			default:
    				editField = "???"
    			break;

    		}

    		return (
    			<div className="form-group">
	                <Icon name={this.props.icon} />
	                {editField}
	            </div>
    		);
    	}
    	else {
            var styleObj = (this.state.color === "") ? {} : {
                backgroundColor: this.state.color
            };
	        return (
	            <span className={this.state.classNames} style={styleObj}>
	                <Icon name={this.props.icon} />
	                {this.props.value}
	            </span>
	        );
	    }
    }
}

export default Stat;
