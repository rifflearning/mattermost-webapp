// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import logoImage from 'images/logo.png';
import {browserHistory} from 'utils/browser_history';
import {LTIConstants} from 'utils/constants.jsx';
import {isValidPassword} from 'utils/utils.jsx';

import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class SignupLTI extends React.Component {
    static get propTypes() {
        return {
            customDescriptionText: PropTypes.string,
            actions: PropTypes.shape({
                createLTIUser: PropTypes.func.isRequired,
            }).isRequired,
            enableSignUpWithLTI: PropTypes.bool,
            passwordConfig: PropTypes.object,
            privacyPolicyLink: PropTypes.string,
            siteName: PropTypes.string,
            termsOfServiceLink: PropTypes.string,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            formData: {},
            loading: false,
            serverError: '',
            usernameError: '',
            emailError: '',
            passwordError: '',
            isSubmitting: false,
            invalidRequest: false,
        };
    }

    componentDidMount() {
        if (this.props.enableSignUpWithLTI) {
            this.decodeRequest(this.extractFormData());
        } else {
            browserHistory.push('/');
        }
    }

    getCookie = (name) => {
        // Implementation from: https://stackoverflow.com/a/25490531/6241000
        const parts = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return parts ? parts.pop() : '';
    };

    deleteCookie = (name) => {
        document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    };

    extractFormData = () => {
        return this.getCookie(LTIConstants.LAUNCH_DATA_COOKIE);
    };

    decodeRequest = (formData) => {
        try {
            const decodedForm = atob(formData);
            const parsedForm = JSON.parse(decodedForm);
            this.setState({formData: parsedForm});
        } catch (e) {
            this.setState({
                invalidRequest: true,
                serverError: (
                    <FormattedMessage
                        id='signup_LTI.invalid_request'
                        defaultMessage='There was an error with your login request. Please try again or contact your system administrator.'
                    />
                ),
            });
        }
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        // bail out if a submission is already in progress
        if (this.state.isSubmitting) {
            return;
        }

        if (this.isPasswordValid()) {
            this.setState({
                usernameError: '',
                emailError: '',
                passwordError: '',
                serverError: '',
                isSubmitting: true,
            });

            const {data, error} = await this.props.actions.createLTIUser({password: this.refs.password.value});
            if (data) {
                this.deleteCookie(LTIConstants.LAUNCH_DATA_COOKIE);
            }
            if (error) {
                this.setState({
                    serverError: error.message,
                    isSubmitting: false,
                });
            }
        }
    };

    isPasswordValid = () => {
        const providedPassword = this.refs.password.value;
        const {valid, error} = isValidPassword(providedPassword, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({
                nameError: '',
                emailError: '',
                passwordError: error,
                serverError: '',
            });
            return false;
        }

        return true;
    };

    renderLTISignup = () => {
        const {formData = {}} = this.state;
        const {
            [LTIConstants.EMAIL_FIELD]: email,
            [LTIConstants.FULLNAME_FIELD]: fullName,
            [LTIConstants.USERNAME_FIELD]: username,
        } = formData;

        let emailError = null;
        let emailDivStyle = 'form-group';
        if (this.state.emailError) {
            emailError = (<label className='control-label'>{this.state.emailError}</label>);
            emailDivStyle += ' has-error';
        }

        let usernameError = null;
        let usernameDivStyle = 'form-group';
        if (this.state.usernameError) {
            usernameError = <label className='control-label'>{this.state.usernameError}</label>;
            usernameDivStyle += ' has-error';
        }

        let passwordError = null;
        let passwordDivStyle = 'form-group';
        if (this.state.passwordError) {
            passwordError = <label className='control-label'>{this.state.passwordError}</label>;
            passwordDivStyle += ' has-error';
        }

        let yourEmailIs = null;
        if (email) {
            yourEmailIs = (
                <FormattedMarkdownMessage
                    id='signup_user_completed.emailIs'
                    defaultMessage="Your email address is **{email}**. You'll use this address to sign in to {siteName}."
                    values={{
                        email,
                        siteName: this.props.siteName,
                    }}
                />
            );
        }

        return (
            <form>
                <div className='inner__content'>
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_LTI.fullname'
                                defaultMessage='Full Name'
                            />
                        </strong></h5>
                        <div className='form-group'>
                            <input
                                id='fullname'
                                type='text'
                                ref='fullname'
                                className='form-control'
                                defaultValue={fullName}
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_LTI.username'
                                defaultMessage='Username'
                            />
                        </strong></h5>
                        <div className={usernameDivStyle}>
                            <input
                                id='username'
                                type='text'
                                ref='username'
                                className='form-control'
                                defaultValue={username}
                                disabled={true}
                            />
                            {usernameError}
                        </div>
                    </div>
                    <div className={'margin--extra'}>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_LTI.email'
                                defaultMessage='Email Address'
                            />
                        </strong></h5>
                        <div className={emailDivStyle}>
                            <input
                                id='email'
                                type='email'
                                ref='email'
                                className='form-control'
                                defaultValue={email}
                                disabled={true}
                            />
                            {emailError}
                        </div>
                    </div>
                    {yourEmailIs}
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_user_completed.choosePwd'
                                defaultMessage='Choose your password'
                            />
                        </strong></h5>
                        <div className={passwordDivStyle}>
                            <input
                                id='password'
                                type='password'
                                ref='password'
                                className='form-control'
                                placeholder=''
                                maxLength='128'
                                spellCheck='false'
                            />
                            {passwordError}
                        </div>
                    </div>
                    <p className='margin--extra'>
                        <button
                            id='createAccountButton'
                            type='submit'
                            onClick={this.handleSubmit}
                            className='btn-primary btn'
                            disabled={this.state.isSubmitting}
                        >
                            <FormattedMessage
                                id='signup_user_completed.create'
                                defaultMessage='Create Account'
                            />
                        </button>
                    </p>
                </div>
            </form>
        );
    };

    render() {
        const {
            customDescriptionText,
            privacyPolicyLink,
            siteName,
            termsOfServiceLink,
        } = this.props;

        let serverError = null;
        if (this.state.serverError) {
            serverError = (
                <div className={'form-group has-error'}>
                    <label className='control-label'>{this.state.serverError}</label>
                </div>
            );
        }

        if (this.state.loading) {
            return (<LoadingScreen/>);
        }

        let ltiSignup = this.renderLTISignup();
        const terms = (
            <p>
                <FormattedMarkdownMessage
                    id='create_team.agreement'
                    defaultMessage='By proceeding to create your account and use {siteName}, you agree to our [Terms of Service]({TermsOfServiceLink}) and [Privacy Policy]({PrivacyPolicyLink}). If you do not agree, you cannot use {siteName}.'
                    values={{
                        siteName,
                        TermsOfServiceLink: termsOfServiceLink,
                        PrivacyPolicyLink: privacyPolicyLink,
                    }}
                />
            </p>
        );

        if (this.state.invalidRequest) {
            ltiSignup = null;
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container padding--less'>
                        <img
                            className='signup-team-logo'
                            src={logoImage}
                        />
                        <SiteNameAndDescription
                            customDescriptionText={customDescriptionText}
                            siteName={siteName}
                        />
                        <h4 className='color--light'>
                            <FormattedMessage
                                id='signup_user_completed.lets'
                                defaultMessage="Let's create your account"
                            />
                        </h4>
                        {ltiSignup}
                        {serverError}
                        {terms}
                    </div>
                </div>
            </div>
        );
    }
}
