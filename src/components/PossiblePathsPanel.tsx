import React from 'react';
import { LostTemplePath } from '../scripts/lostTemplePath';
import LostTemple from './LostTemple';
import styled from '@emotion/styled';
import { Paper, Typography } from '@mui/material';

interface PossiblePathsPanelProps {
  readonly width: number;
  readonly numColumns: number;
  readonly possiblePaths: readonly LostTemplePath[];
}

function PossiblePathsPanel({ width, numColumns, possiblePaths }: PossiblePathsPanelProps) {
  const columnWidth = (width - 2 * sidePanelPadding - (numColumns - 1) * gridPadding) / numColumns;
  const filteredCount = possiblePaths.reduce((p, c) => p + c.count, 0);
  const lostTemplePaths = possiblePaths.map((p) => {
    // TODO: use a unique ID (i.e. the index in the raw data list)
    const key = Array.from(p.openDoors).sort().join('|');
    return (
      <ItemContainer key={key}>
        <LostTemple
          size={columnWidth}
          openRooms={p.openRooms}
          openDoors={p.openDoors}
          showRoomNames={false}
        />
        <Typography variant="body1">
          {`${p.count} / ${filteredCount} (${Math.round((p.count / filteredCount) * 1000) / 10}%)`}
        </Typography>
      </ItemContainer>
    );
  });
  const length = possiblePaths.length;
  const possiblePathSuffix = length === 1 ? '' : 's';
  const possiblePathText = `${length} possible path${possiblePathSuffix}`;
  return (
    <SidePanel width={width} elevation={4}>
      <ColumnContainer>
        <Typography variant="h6">{possiblePathText}</Typography>
        <GridContainer numColumns={numColumns} columnWidth={columnWidth}>
          {lostTemplePaths}
        </GridContainer>
      </ColumnContainer>
    </SidePanel>
  );
}

const sidePanelPadding = 16;
const gridPadding = 16;

const SidePanel = styled(Paper)<{ readonly width: number }>`
  width: ${({ width }) => width}px;
  height: 100vh;
  padding: ${sidePanelPadding}px;
  box-sizing: border-box;
  overflow-y: auto;
`;

const ColumnContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GridContainer = styled.div<{
  readonly columnWidth: number;
  readonly numColumns: number;
}>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ columnWidth, numColumns }) => toCssValue(columnWidth, numColumns)};
  grid-gap: ${gridPadding}px;
`;

const ItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
`;

function toCssValue(columnWidth: number, numColumns: number) {
  return Array(numColumns)
    .fill(columnWidth)
    .map((c) => `${c}px`)
    .join(' ');
}

export default PossiblePathsPanel;
