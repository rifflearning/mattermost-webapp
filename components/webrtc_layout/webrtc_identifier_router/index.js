import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {onWebRtcByIdentifierEnter} from './actions';
import WebRtcIdentifierRouter from './webrtc_identifier_router.jsx';

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            onWebRtcByIdentifierEnter
        }, dispatch),
    };
}

export default withRouter(connect(null, mapDispatchToProps)(WebRtcIdentifierRouter));
