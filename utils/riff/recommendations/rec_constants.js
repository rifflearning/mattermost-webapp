// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

//The maximum number of recommendations that will be displayed at once.
const MAX_REC_DISPLAY_NUMBER = 3;

/**
 * Enumeration of recommendation types.
 * @readonly
 * @enum {string}
 */
const RecommendationTypes = {

    /** Complete by posting in the public 'Town Square' channel */
    TOWN_SQUARE_POST: 'PostToTownSquareChannel',

    /** Complete by having 2 video meetings in the current week */
    TWO_VIDEO_MEETINGS: 'TwoVideoMeetingsPerWeek',

    /** Complete by having interactions with 10 different users */
    CONNECT_WITH_OTHERS: 'ConnectWithCourse',

    /** Complete by posting in your (current user's) private PLG team channel */
    PLG_POST: 'PostInPLGChannel',

    /** Complete by participating in a video chat with some members of your PLG team */
    PLG_VIDEO: 'VideoChatWithPLGTeam',

    /** Complete by posting in your (current user's) private Capstone team channel */
    CAPSTONE_POST: 'PostInCapstoneChannel',

    /** Complete by participating in a video chat with some members of your Capstone team */
    CAPSTONE_VIDEO: 'VideoChatWithCapstoneTeam',
};

/* **************************************************************************** *
 * Module exports                                                               *
 * **************************************************************************** */
export {
    RecommendationTypes,
    MAX_REC_DISPLAY_NUMBER,
};
