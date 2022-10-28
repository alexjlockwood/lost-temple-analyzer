import React from 'react';
import './App.css';
import Cell from './Cell';
import styled, { css } from 'styled-components';
import { LostTemplePath } from './LostTemplePath';
import Grid2 from '@mui/material/Unstable_Grid2'; // Grid version 2
import LostTemple from './LostTemple';
import { getOpenRooms } from './App';

interface PossiblePathsGridProps {
  readonly possiblePaths: readonly LostTemplePath[];
}

// function PossiblePathsGrid({ possiblePaths }: PossiblePathsGridProps) {
//   const lostTemplePaths = possiblePaths.map((p) => {
//     return (
//       <LostTemple
//         openRooms={getOpenRooms(p)}
//         openDoors={p.openDoors}
//         showRoomNames={false}
//       />
//     );
//   });
//   return <div>{lostTemplePaths}</div>;
// }

// export default PossiblePathsGrid;
