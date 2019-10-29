// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';

//import {shallow} from 'enzyme';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import AboutBuildModal from 'components/about_build_modal/about_build_modal.jsx';

describe('components/AboutBuildModal', () => {
    const RealDate = Date;

    function mockDate(date) {
        global.Date = class extends RealDate {
            constructor() {
                super();
                return new RealDate(date);
            }
        };
    }

    let config = null;
    let license = null;

    afterEach(() => {
        global.Date = RealDate;
        config = null;
        license = null;
    });

    beforeEach(() => {
        mockDate('2017-06-01');

        config = {
            BuildEnterpriseReady: 'true',
            Version: '3.6.0',
            BuildNumber: '3.6.2',
            SQLDriverName: 'Postgres',
            BuildHash: 'abcdef1234567890',
            BuildHashEnterprise: '0123456789abcdef',
            BuildDate: '21 January 2017',
        };
        license = {
            IsLicensed: 'true',
            Company: 'Mattermost Inc',
        };
    });

    test('should call onModalDismissed callback when the modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <AboutBuildModal
                config={config}
                license={license}
                webappBuildHash='0a1b2c3d4f'
                show={true}
                onModalDismissed={onHide}
            />
        );

        wrapper.find(Modal).first().props().onHide();
    });
});
