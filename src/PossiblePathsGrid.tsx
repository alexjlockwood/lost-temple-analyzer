import React from 'react';
import './App.css';
import Cell from './Cell';
import styled, { css } from 'styled-components';
import { LostTemplePath } from './LostTemplePath';
import Grid from '@mui/material/Grid'; // Grid version 2
import LostTemple from './LostTemple';
import { getOpenRooms } from './App';

interface PossiblePathsGridProps {
  readonly possiblePaths: readonly LostTemplePath[];
}

// function PossiblePathsGrid({ possiblePaths }: PossiblePathsGridProps) {
//   const lostTemplePaths = possiblePaths.map((p) => {
//     // TODO: confirm this key is correct
//     const key = Array.from(p.openDoors).sort().join('|');
//     return (
//       <Grid spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} key={key}>
//         {Array.from(Array(6)).map((_, index) => (
//           <Grid xs={2} sm={4} md={4} key={index}>
//             <LostTemple
//               size={300}
//               openRooms={getOpenRooms(p)}
//               openDoors={p.openDoors}
//               showRoomNames={false}
//             />
//           </Grid>
//         ))}
//       </Grid>
//     );
//   });
//   return <div>{lostTemplePaths}</div>;
// }

// export default PossiblePathsGrid;
