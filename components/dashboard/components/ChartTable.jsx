// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint
    header/header: "off",
    dot-location: ["error", "property"],
    indent: ["error", 4, { "CallExpression": { "arguments": "first" } }],
    "react/jsx-max-props-per-line": ["error", { "when": "multiline" }],
 */

import React from 'react';
import styled from 'styled-components';

const SROnly = styled.div`
position:absolute;
left:-10000px;
top:auto;
width:1px;
height:1px;
overflow:hidden;
`;

const ChartTable = ({cols, rows}) => {
    return (rows.length) ? (
        <SROnly>
            <table>
                <thead>
                    <tr>
                        {cols.map((col) => (
                            <th key={col} scope='column'>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row[0]}>
                            <th scope='row'>{row[0]}</th>
                            {row.slice(1).map((cell) => (
                                <td key={cell}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </SROnly>
    ) : null;
};

export default ChartTable;
