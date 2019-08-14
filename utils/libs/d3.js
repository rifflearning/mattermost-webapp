/* ******************************************************************************
 * d3.js                                                                        *
 * *************************************************************************/ /**
 *
 * @fileoverview Aggregate the d3 microlibraries that this project uses
 *
 * Collect all the d3 microlibraries that this project uses under a single
 * d3 namespace without importing the d3 kitchen sink package.
 *
 *   import d3 from './d3';
 *
 * Created on       October 15, 2018
 * @author          Michael Jay Lippert
 *
 * @copyright (c) 2018 Riff Learning,
 *            MIT License (see https://opensource.org/licenses/MIT)
 *
 * ******************************************************************************/

// Riff Learning lint overrides
/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" }, "ObjectExpression": "first" }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
    "no-underscore-dangle": ["error", { "allow": [ "_id" ] }],
*/

import * as d3Selection from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Transition from 'd3-transition';
import * as d3Time from 'd3-time';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Axis from 'd3-axis';

export const d3 = Object.assign({},
                                d3Selection,
                                d3Scale,
                                d3Transition,
                                d3Time,
                                d3TimeFormat,
                                d3Axis,
);

export default d3;
