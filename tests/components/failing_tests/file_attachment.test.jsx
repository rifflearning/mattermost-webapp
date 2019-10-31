// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {mount} from 'enzyme';

import FileAttachment from 'components/file_attachment/file_attachment.jsx';

jest.mock('utils/utils.jsx', () => {
    const original = require.requireActual('utils/utils.jsx');
    return {
        ...original,
        loadImage: jest.fn((id, callback) => callback()),
    };
});

function createComponent({fileInfo, handleImageClick, index, compactDisplay, canDownloadFiles = true} = {}) {
    const fileInfoProp = fileInfo || {
        id: 1,
        extension: 'pdf',
        name: 'test.pdf',
        size: 100,
    };
    const indexProp = index || 3;
    const handleImageClickProp = handleImageClick || jest.fn();
    return (
        <FileAttachment
            fileInfo={fileInfoProp}
            handleImageClick={handleImageClickProp}
            index={indexProp}
            compactDisplay={compactDisplay}
            canDownloadFiles={canDownloadFiles}
        />
    );
}

describe('component/FileAttachment', () => {
    test('should call the handleImageClick on attachment clicked', () => {
        const handleImageClick = jest.fn();
        const wrapper = mount(createComponent({handleImageClick}));
        wrapper.find('.post-image__thumbnail').simulate('click');
        expect(handleImageClick).toBeCalled();
    });
});
