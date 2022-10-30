import React from 'react';
import { getOpenRooms, LostTemplePath } from '../scripts/lostTemplePath';
import LostTemple from './LostTemple';
import styled from '@emotion/styled';
import { Paper, Typography } from '@mui/material';

interface PossiblePathsPanelProps {
  readonly width: number;
  readonly possiblePaths: readonly LostTemplePath[];
}

function PossiblePathsPanel({ width, possiblePaths }: PossiblePathsPanelProps) {
  const lostTemplePaths = possiblePaths.map((p) => {
    // TODO: use a unique ID (i.e. the index in the raw data list)
    const key = Array.from(p.openDoors).sort().join('|');
    return (
      <LostTemple
        key={key}
        size={150}
        openRooms={getOpenRooms(p)}
        openDoors={p.openDoors}
        showRoomNames={false}
      />
    );
  });
  const length = possiblePaths.length;
  const possiblePathSuffix = length === 1 ? '' : 's';
  const possiblePathText = `${length} possible path${possiblePathSuffix}`;
  return (
    <SidePanel width={width} elevation={4}>
      <ColumnContainer>
        <Typography variant="h6">{possiblePathText}</Typography>
        <GridContainer>{lostTemplePaths}</GridContainer>
      </ColumnContainer>
    </SidePanel>
  );
}

const sidePanelPadding = 16;

const SidePanel = styled(Paper)<{ readonly width: number }>`
  width: ${(props) => props.width}px;
  height: 100vh;
  //padding: ${sidePanelPadding}px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GridContainer = styled.div`
  width: 100%;
`;

export default PossiblePathsPanel;
