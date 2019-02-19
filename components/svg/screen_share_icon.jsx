// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
 */

import React from 'react';

import {localizeMessage} from 'utils/utils.jsx';

export default class ScreenShareIcon extends React.PureComponent {
    render() {
        if (this.props.screenSharing) {
            return (
                <span {...this.props}>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='24'
                        height='24'
                        viewBox='0 0 24 24'
                        role='icon'
                        aria-label={localizeMessage('generic_icons.screen_sharing_stop', 'Stop Screen Sharing Icon')}
                    >
                        <path
                            fill='none'
                            d='M0 0h24v24H0V0z'
                        />
                        <path
                            fill='rgba(0, 0, 0, 0.54)'
                            d='M21.22 18.02l2 2H24v-2h-2.78zm.77-2l.01-10c0-1.11-.9-2-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10c0 1.1.89 2 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73zM7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47z'
                        />
                    </svg>
                </span>
            );
        }

        return (
            <span {...this.props}>
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    role='icon'
                    aria-label={localizeMessage('generic_icons.screen_sharing_start', 'Start Screen Sharing Icon')}
                >
                    <path
                        fill='none'
                        d='M0 0h24v24H0V0z'
                    />
                    <path
                        fill='rgba(0, 0, 0, 0.54)'
                        d='M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z'
                    />
                </svg>
            </span>
        );
    }
}
