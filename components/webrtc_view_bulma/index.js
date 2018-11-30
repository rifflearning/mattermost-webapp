import {react, PureComponent} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {ScaleLoader} from 'react-spinners';

import WebRtc from './webrtc.jsx';
import * as WebRtcActionCreators from '../../actions/webrtc_actions';
import * as RiffServerActionCreators from '../../actions/views/riff';

const mapStateToProps = (state) => {
    //console.log("state:", state);
    return {
        ...state.views.webrtc,
        riff: state.views.riff,
        user: getCurrentUser(state),
        mediaError: state.views.webrtc.getMediaStatus === "error"
    };
};

// use bindActionCreators here to reduce boilerplate
const mapDispatchToProps = (dispatch) => {
    console.log("creating webrtc component...");
    return {...bindActionCreators(WebRtcActionCreators, dispatch),
            ...bindActionCreators(RiffServerActionCreators, dispatch),
            authenticateRiff: () => {
                console.log("attempt data-server auth");
                dispatch(RiffServerActionCreators.attemptRiffAuthenticate());
            },
    dispatch};
}

const LoadingView = () => {
    return (
        <div className="columns has-text-centered is-centered is-vcentered" style={{minHeight: "100vh"}}>
          <div className="column is-vcentered has-text-centered">
            <ScaleLoader color={"#8A6A94"}/>
          </div>
        </div>
    );
};

class WebRtcContainer extends PureComponent {
    constructor(props) {
        super(props);
    }

    componentWillMount () {
        if (!this.props.riff.authToken) {
            this.props.authenticateRiff();
        }
    }

    render()  {
        if (!this.props.riff.authToken) {
            return (<LoadingView/>);
        } else {
            return (<WebRtc {...this.props}/>);
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(WebRtcContainer);
