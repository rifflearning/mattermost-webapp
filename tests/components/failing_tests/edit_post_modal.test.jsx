// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';

//import {shallow} from 'enzyme';
import ReactRouterEnzymeContext from 'react-router-enzyme-context';

import {mountWithIntl} from 'tests/helpers/intl-test-helper.jsx';
import {Constants/*, ModalIdentifiers */} from 'utils/constants';

//import DeletePostModal from 'components/delete_post_modal';
import EditPostModal from 'components/edit_post_modal/edit_post_modal.jsx';

jest.useFakeTimers();

jest.mock('actions/global_actions.jsx', () => ({
    emitClearSuggestions: jest.fn(),
}));

function createEditPost({ctrlSend, config, license, editingPost, actions} = {}) {
    const ctrlSendProp = ctrlSend || false;
    const configProp = config || {
        AllowEditPost: 'always',
        PostEditTimeLimit: 300,
        EnableEmojiPicker: 'true',
    };
    const licenseProp = license || {
        IsLicensed: 'false',
    };
    const editingPostProp = editingPost || {
        postId: '123',
        post: {
            id: '123',
            message: 'test',
            channel_id: '5',
        },
        commentCount: 3,
        refocusId: 'test',
        show: true,
        title: 'test',
    };
    const actionsProp = actions || {
        editPost: jest.fn(),
        addMessageIntoHistory: jest.fn(),
        hideEditPostModal: jest.fn(),
        openModal: jest.fn(),
    };
    return (
        <EditPostModal
            ctrlSend={ctrlSendProp}
            config={configProp}
            license={licenseProp}
            editingPost={editingPostProp}
            actions={actionsProp}
            maxPostSize={Constants.DEFAULT_CHARACTER_LIMIT}
        />
    );
}

describe('components/EditPostModal', () => {
    it('should add emoji to editText when an emoji is clicked', () => {
        const options = new ReactRouterEnzymeContext();
        const wrapper = mountWithIntl(createEditPost(), options.get());
        wrapper.setState({editText: ''});
        wrapper.instance().handleEmojiClick(null);
        wrapper.instance().handleEmojiClick({});
        wrapper.instance().handleEmojiClick({aliases: []});
        expect(wrapper.state().editText).toBe('');

        wrapper.setState({editText: ''});
        wrapper.instance().handleEmojiClick({name: '+1', aliases: ['thumbsup']});
        expect(wrapper.state().editText).toBe(':+1: ');

        wrapper.setState({editText: 'test'});
        wrapper.instance().handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test :-1: ');

        wrapper.setState({editText: 'test '});
        wrapper.instance().handleEmojiClick({name: '-1', aliases: ['thumbsdown']});
        expect(wrapper.state().editText).toBe('test :-1: ');
    });

    it('should set the focus and recalculate the size of the edit box after entering', () => {
        const options = new ReactRouterEnzymeContext();
        const wrapper = mountWithIntl(createEditPost(), options.get());
        const instance = wrapper.instance();
        const ref = instance.editbox;
        ref.focus = jest.fn();
        ref.recalculateSize = jest.fn();
        expect(ref.focus).not.toBeCalled();
        expect(ref.recalculateSize).not.toBeCalled();
        instance.handleEntered();
        expect(ref.focus).toBeCalled();
        expect(ref.recalculateSize).toBeCalled();
    });

    it('should hide the preview when exiting', () => {
        const options = new ReactRouterEnzymeContext();
        const wrapper = mountWithIntl(createEditPost(), options.get());
        const instance = wrapper.instance();
        const ref = instance.editbox;
        ref.hidePreview = jest.fn();
        expect(ref.hidePreview).not.toBeCalled();
        instance.handleExit();
        expect(ref.hidePreview).toBeCalled();
    });

    it('should handle edition on key press enter depending on the conditions', () => {
        const options = new ReactRouterEnzymeContext();
        global.navigator = {userAgent: 'Android'};
        var wrapper = mountWithIntl(createEditPost({ctrlSend: true}), options.get());
        var instance = wrapper.instance();
        const preventDefault = jest.fn();
        instance.handleEdit = jest.fn();
        instance.handleEditKeyPress({which: 1, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: false, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).toBeCalled();
        expect(preventDefault).toBeCalled();

        global.navigator = {userAgent: 'Chrome'};
        wrapper = mountWithIntl(createEditPost({ctrlSend: false}), options.get());
        instance = wrapper.instance();
        preventDefault.mockClear();
        instance.handleEdit = jest.fn();
        instance.handleEditKeyPress({which: 1, ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: true, altKey: false});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], which: Constants.KeyCodes.ENTER[1], ctrlKey: true, preventDefault, shiftKey: false, altKey: true});
        expect(instance.handleEdit).not.toBeCalled();
        expect(preventDefault).not.toBeCalled();
        instance.handleEditKeyPress({key: Constants.KeyCodes.ENTER[0], ctrlKey: true, preventDefault, shiftKey: false, altKey: false});
        expect(instance.handleEdit).toBeCalled();
        expect(preventDefault).toBeCalled();
    });

    it('should handle the escape key manually to hide the modal', () => {
        const options = new ReactRouterEnzymeContext();
        const wrapper = mountWithIntl(createEditPost({ctrlSend: true}), options.get());
        const instance = wrapper.instance();
        instance.handleHide = jest.fn();
        instance.handleExit = jest.fn();

        instance.handleKeyDown({keyCode: 1});
        expect(instance.handleHide).not.toBeCalled();

        instance.handleKeyDown({key: Constants.KeyCodes.ESCAPE[0], keyCode: Constants.KeyCodes.ESCAPE[1]});
        expect(instance.handleHide).toBeCalled();
    });
});
