// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {areTimezonesEnabledAndSupported} from 'selectors/general';

import ProfilePopover from './profile_popover.jsx';

function mapStateToProps(state) {
    return {
        enableTimezone: areTimezonesEnabledAndSupported(state),
    };
}

export default connect(mapStateToProps)(ProfilePopover);
