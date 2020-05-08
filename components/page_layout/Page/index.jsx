// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import {connect} from 'react-redux';

import {getIsRhsOpen, getIsRhsMenuOpen} from 'selectors/rhs';
import {getLastViewedChannelNameByTeamName} from 'selectors/local_storage';

import Page from './page';

const mapStateToProps = (state, ownProps) => ({
    lastChannelPath: `${ownProps.match.url}/channels/${getLastViewedChannelNameByTeamName(state, ownProps.match.params.team)}`,
    rhsOpen: getIsRhsOpen(state),
    rhsMenuOpen: getIsRhsMenuOpen(state),
});

export default connect(mapStateToProps)(Page);
