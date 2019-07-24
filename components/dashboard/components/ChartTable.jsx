// Copyright (c) 2018-present Riff Learning, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

const SROnly = styled.div`
position:absolute;
top:auto;
width:1px;
height:1px;
overflow:hidden;
`;

const ChartTable = ({cols, rows, caption}) => {
    return (rows.length) ? (
        <SROnly>
            <table>
                {caption ? <caption>{caption}</caption> : null}
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
