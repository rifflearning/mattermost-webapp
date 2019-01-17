// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {getConfig} from 'mattermost-redux/selectors/entities/general';

import {getPasswordConfig} from 'utils/utils.jsx';

import SignupLTI from './signup_lti.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    const enableSignUpWithLTI = config.EnableSignUpWithLTI === 'true';
    const siteName = config.SiteName;
    const termsOfServiceLink = config.TermsOfServiceLink;
    const privacyPolicyLink = config.PrivacyPolicyLink;
    const customDescriptionText = config.CustomDescriptionText;

    return {
        customDescriptionText,
        enableSignUpWithLTI,
        passwordConfig: getPasswordConfig(config),
        privacyPolicyLink,
        siteName,
        termsOfServiceLink,
    };
}

export default connect(mapStateToProps)(SignupLTI);
