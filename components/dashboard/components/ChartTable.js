import React, { Component } from 'react';
import styled from 'styled-components';

const SROnly = styled.div`
position:absolute;
left:-10000px;
top:auto;
width:1px;
height:1px;
overflow:hidden;
`;

const ChartTable = ({cols, rows}) => (rows.length) ? (
  <SROnly>
    <table>
      <thead>
        <tr>
          {cols.map(col => (
            <th key={col} scope="column">{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
      {rows.map((row, i) => (
        <tr key={row[0]}>
          <th scope="row">{row[0]}</th>
          {row.slice(1).map(cell => (
           <td key={cell}>{cell}</td>
          ))}
        </tr>
      ))}
      </tbody>
    </table>
  </SROnly>
) : null;

 export default ChartTable;
