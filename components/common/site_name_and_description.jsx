// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

export default class SiteNameAndDescription extends React.PureComponent {
    static propTypes = {
        customDescriptionText: PropTypes.string,
        siteName: PropTypes.string,
    };

    static defaultProps = {
        siteName: 'Mattermost',
    };

    render() {
        const {
            customDescriptionText,
            siteName,
        } = this.props;
        let description = null;
        if (customDescriptionText) {
            description = customDescriptionText;
        } else {
            description = (
                <FormattedMessage
                    id='web.root.signup_info'
                    defaultMessage='All team communication in one place, searchable and accessible anywhere'
                />
            );
        }

        return (
            <React.Fragment>
                <h1>{siteName}</h1>
                <p className='color--light h4'>
                    {description}
                </p>
            </React.Fragment>
        );
    }
}
