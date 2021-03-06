// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {updateChannelNotifyProps} from 'mattermost-redux/actions/channels';
import {isCurrentChannelReadOnly} from 'mattermost-redux/selectors/entities/channels';

import {
    closeRightHandSide as closeRhs,
    updateRhsState,
    showPinnedPosts,
    toggleMenu as toggleRhsMenu,
    closeMenu as closeRhsMenu,
} from 'actions/views/rhs';
import {toggle as toggleLhs, close as closeLhs} from 'actions/views/lhs';
import {getRhsState} from 'selectors/rhs';
import {RHSStates} from 'utils/constants.jsx';

import Navbar from './navbar.jsx';

function mapStateToProps(state) {
    const rhsState = getRhsState(state);

    return {
        isPinnedPosts: rhsState === RHSStates.PIN,
        isReadOnly: isCurrentChannelReadOnly(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            updateRhsState,
            showPinnedPosts,
            toggleLhs,
            closeLhs,
            closeRhs,
            toggleRhsMenu,
            closeRhsMenu,
            updateChannelNotifyProps,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
