// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

//import {shallow} from 'enzyme';
import {Modal} from 'react-bootstrap';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import PostDeletedModal from 'components/post_deleted_modal.jsx';

describe('components/ChannelInfoModal', () => {
    test('should call onHide callback when modal is hidden', (done) => {
        function onHide() {
            done();
        }

        const wrapper = mountWithIntl(
            <PostDeletedModal
                show={true}
                onHide={onHide}
            />
        );

        wrapper.find(Modal).first().props().onHide();
    });
});
