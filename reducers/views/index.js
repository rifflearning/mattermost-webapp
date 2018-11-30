// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';

import admin from './admin';
import browser from './browser';
import channel from './channel';
import dashboard from './dashboard';
import rhs from './rhs';
import posts from './posts';
import modals from './modals';
import emoji from './emoji';
import lhs from './lhs';
import search from './search';
import notice from './notice';

import webrtc from './webrtc';
import riff from './riff';

export default combineReducers({
    admin,
    browser,
    channel,
    dashboard,
    rhs,
    posts,
    modals,
    emoji,
    lhs,
    search,
    notice,
    webrtc,
    riff,
});
