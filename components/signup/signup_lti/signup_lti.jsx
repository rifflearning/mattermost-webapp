// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import Constants from 'utils/constants.jsx';
import logoImage from 'images/logo.png';

import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import SiteNameAndDescription from 'components/common/site_name_and_description';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';

export default class SignupLTI extends React.Component {
    static get propTypes() {
        return {
            siteName: PropTypes.string,
            termsOfServiceLink: PropTypes.string,
            privacyPolicyLink: PropTypes.string,
            customDescriptionText: PropTypes.string,
        };
    }

    constructor(props) {
        super(props);

        this.state = {
            email: 'jsmith@uni.email.com',
            loading: false,
            serverError: '',
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();

        // bail out if a submission is already in progress
        if (this.state.isSubmitting) {
            return;
        }

        this.setState({
            usernameError: '',
            emailError: '',
            passwordError: '',
            serverError: '',
            isSubmitting: true,
        });
    };

    renderLTISignup = () => {
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
        if (this.state.email) {
            yourEmailIs = (
                <FormattedMarkdownMessage
                    id='signup_user_completed.emailIs'
                    defaultMessage="Your email address is **{email}**. You'll use this address to sign in to {siteName}."
                    values={{
                        email: this.state.email,
                        siteName: this.props.siteName,
                    }}
                />
            );
        }

        return (
            <form>
                <div className='inner__content'>
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
                                defaultValue={this.state.email}
                                placeholder=''
                                maxLength='128'
                                spellCheck='false'
                                autoCapitalize='off'
                                disabled={true}
                            />
                            {emailError}
                        </div>
                    </div>
                    {yourEmailIs}
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
                                defaultValue='John Smith'
                                spellCheck='false'
                                disabled={true}
                            />
                        </div>
                    </div>
                    <div className='margin--extra'>
                        <h5><strong>
                            <FormattedMessage
                                id='signup_LTI.position'
                                defaultMessage='Position'
                            />
                        </strong></h5>
                        <div className='form-group'>
                            <input
                                id='position'
                                type='text'
                                ref='position'
                                className='form-control'
                                defaultValue='Student'
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
                                defaultValue='jsmith'
                                placeholder=''
                                maxLength={Constants.MAX_USERNAME_LENGTH}
                                spellCheck='false'
                                autoCapitalize='off'
                                disabled={true}
                            />
                            {usernameError}
                        </div>
                    </div>
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

        const ltiSignup = this.renderLTISignup();
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
