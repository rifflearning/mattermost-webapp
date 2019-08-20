// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

// This file only
/* eslint "no-underscore-dangle": "off" */

/*
 * Usage:
 * <PopoverStickOnHover
 *    component={<div>Holy guacamole! I'm Sticky.</div>}
 *    placement="top"
 *    onMouseEnter={() => { }}
 *    delay={200}
 * >
 *   <div>Show the sticky tooltip</div>
 * </PopoverStickOnHover>
 */

import React from 'react';
import PropTypes from 'prop-types';
import {Overlay, Tooltip} from 'react-bootstrap';

import {logger} from 'utils/riff';

export default class PopoverStickOnHover extends React.Component {
    static propTypes = {
        delay: PropTypes.number,
        onMouseEnter: PropTypes.func,
        children: PropTypes.element.isRequired,
        component: PropTypes.node.isRequired,
        placement: PropTypes.string,
    };

    static defaultProps = {
        delay: 0,
    };

    constructor(props) {
        super(props);

        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        this.state = {
            showPopover: false,
        };
    }

    handleMouseEnter() {
        const {delay, onMouseEnter} = this.props;

        this.setTimeoutConst = setTimeout(() => {
            this.setState({showPopover: true}, () => {
                if (onMouseEnter) {
                    onMouseEnter();
                }
            });
        }, delay);
    }

    handleMouseLeave() {
        clearTimeout(this.setTimeoutConst);
        this.setState({showPopover: false});
    }

    componentWillUnmount() {
        if (this.setTimeoutConst) {
            clearTimeout(this.setTimeoutConst);
        }
    }

    onMouseEnter() {
        this.setState({showPopover: true});
    }

    onMouseLeave() {
        this.handleMouseLeave();
    }

    render() {
        const {component, children, placement} = this.props;

        // TODO: figure out what this is doing because it isn't making sense to me.
        //       why use map if you only care about the 1st element? Why do we care
        //       only about the 1st element? Why do we clone this element?
        //       a lot to understand -mjl 2019-08-20
        const child = React.Children.map(children, (child) => (
            React.cloneElement(child, {
                onMouseEnter: this.handleMouseEnter,
                onMouseOver: this.handleMouseEnter,
                onMouseOut: this.handleMouseLeave,
                onMouseLeave: this.handleMouseLeave,
                ref: (node) => {
                    this._child = node;
                    const {ref} = child;
                    if (typeof ref === 'function') {
                        ref(node);
                    }
                },
            })
        ))[0];

        return (
            <React.Fragment>
                {child}
                <Overlay
                    show={this.state.showPopover}
                    placement={placement}
                    target={this._child}
                    shouldUpdatePosition={true}
                >
                    <Tooltip
                        onMouseEnter={() => {
                            logger.debug('mouseEnter.');
                            this.setState({showPopover: true});
                        }}
                        onMouseLeave={this.handleMouseLeave}
                        onMouseOver={() => {
                            logger.debug('mouseOver.');
                            this.setState({showPopover: true});
                        }}
                        onMouseOut={this.handleMouseLeave}
                        id='popover'
                    >
                        {component}
                    </Tooltip>
                </Overlay>
            </React.Fragment>
        );
    }
}

