// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
 */

import React from 'react';

import RiffLogoImg from 'images/Riff-32x32.svg';

export const RiffLogo = (props) => {
    return (
        <span {...props}>
            <img
                src={RiffLogoImg}
                alt='Riff Learning Logo'
                className='icon'
            />
        </span>
    );
};

