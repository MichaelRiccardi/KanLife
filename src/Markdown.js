// @flow

import React, { Component } from "react";

type Props = {
  content: string,
  checkboxAction: Function,
};

type State = {};

class Markdown extends Component<Props, State> {
  constructor(props: Props) {
    super();
    this.state = {};
  }

  markdownToHTML = (
    markdown: string,
    i: number
  ): Array<string | HTMLElement> => {
    const rules = [
      {
        // header "1"
        regex: /^(# )(.*?)(\n)/gm,
        symbol: "# ",
        element: (inner, key) => <h5 key={key}>{inner}</h5>,
      },
      {
        // header "2"
        regex: /^(## )(.*?)(\n)/gm,
        symbol: "## ",
        element: (inner, key) => <h6 key={key}>{inner}</h6>,
      },
      {
        // bullets
        regex: /^(\*\s)(.*?)(\n)/gm,
        symbol: "* ",
        element: (inner, key) => <li key={key}>{inner}</li>,
      },
      {
        // checkbox unchecked
        regex: /^(\[ \] )(.*?)(\n)/gim,
        symbol: "[ ] ",
        element: (inner, key) => (
          <div key={key} style={{ lineHeight: 1 }}>
            <label key={key}>
              <input
                type="checkbox"
                checked={false}
                readOnly={true}
                onClick={event => {
                  this.props.checkboxAction(inner, event.target.checked);
                }}
              />
              {inner}
            </label>
          </div>
        ),
      },
      {
        // checkbox checked
        regex: /^(\[X\] )(.*?)(\n)/gim,
        symbol: "[X] ",
        element: (inner, key) => (
          <div key={key} style={{ lineHeight: 1 }}>
            <label key={key}>
              <input
                type="checkbox"
                checked={true}
                readOnly={true}
                onClick={event => {
                  this.props.checkboxAction(inner, event.target.checked);
                }}
              />
              {inner}
            </label>
          </div>
        ),
      },
      {
        // link
        regex: /(\[)(.*?)(\]\()(.*?)(\))/g,
        symbol: "[",
        element: (inner, key) => <code key={key}>{inner}</code>,
        link: true,
      },
      {
        // highlight
        regex: /(`)(.*?)(`)/g,
        symbol: "`",
        element: (inner, key) => <code key={key}>{inner}</code>,
      },
      {
        // bold
        regex: /(\*\*)(.*?)(\*\*)/g,
        symbol: "**",
        element: (inner, key) => <strong key={key}>{inner}</strong>,
      },
      {
        // italics
        regex: /(_)(.*?)(_)/g,
        symbol: "_",
        element: (inner, key) => <em key={key}>{inner}</em>,
      },
      {
        // strikethrough
        regex: /(~)(.*?)(~)/g,
        symbol: "~",
        element: (inner, key) => <del key={key}>{inner}</del>,
      },
    ];

    if (i >= rules.length || !markdown) {
      return markdown;
    }

    const split = markdown.split(rules[i].regex);
    let result = [];
    for (let s = 0; s < split.length; s++) {
      if (split[s] === rules[i].symbol) {
        if (rules[i].link) {
          // link temp
          result.push(
            <a
              href={split[s + 3]}
              key={s}
              target="_blank"
              rel="noopener noreferrer"
            >
              {this.markdownToHTML(split[s + 1], 0)}
            </a>
          );
          s += 4;
        } else {
          result.push(
            rules[i].element(this.markdownToHTML(split[s + 1], 0), s)
          );
          s += 2;
        }
      } else {
        result.push(this.markdownToHTML(split[s], i + 1));
      }
    }

    return result;
  };

  render() {
    let { content } = this.props;
    //content = content.replace(/(\*\*)(.*?)\1/g, <strong>$2</strong>);

    //content = ["Wow", <strong>bold</strong>, "font"];

    return <p>{this.markdownToHTML(content + "\n", 0)}</p>;
  }
}

export default Markdown;
