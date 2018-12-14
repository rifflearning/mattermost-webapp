import {connect} from 'react-redux';
import {getIsRhsOpen, getIsRhsMenuOpen} from 'selectors/rhs';
import {getLastViewedChannelNameByTeamName} from 'selectors/local_storage';

import Page from './page';

const mapStateToProps = (state, ownProps) => ({
    lastChannelPath: `${ownProps.match.url}/channels/${getLastViewedChannelNameByTeamName(state, ownProps.match.params.team)}`,
    rhsOpen: getIsRhsOpen(state),
    rhsMenuOpen: getIsRhsMenuOpen(state)
});

export default connect(mapStateToProps)(Page);
