import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch, Redirect} from 'react-router-dom';
import classNames from 'classnames';
import Dashboard from 'components/dashboard';

import PermalinkView from 'components/permalink_view';
import Navbar from 'components/navbar';

export default class Page extends React.PureComponent {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                identifier: PropTypes.string.isRequired,
                team: PropTypes.string.isRequired
            }).isRequired,
        }).isRequired,
        location: PropTypes.object.isRequired,
        // TODO: possible this should be last video path instead
        // to redirect to the right videochat they were last at.
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                key='inner-wrap'
                className={classNames('inner-wrap', 'channel__wrap', {
                    'move--right': this.props.lhsOpen,
                    'move--left': this.props.rhsOpen,
                    'move--left-small': this.props.rhsMenuOpen,
                })}
            >
                <div className='row header'>
                    <div id='navbar'>
                        <Navbar/>
                    </div>
                </div>
                <div className='row main'>
                    <Switch>
                        <Route
                        path={'/:team/pages/:identifier(dashboard)'}
                        component={Dashboard}
                        />
                    </Switch>
                </div>
            </div>
        );
    }
} 
