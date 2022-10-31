import React from 'react';
import { LostTemplePath } from '../scripts/lostTemplePath';
import LostTemple from './LostTemple';
import styled from '@emotion/styled';
import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { intersection } from '../scripts/mathUtils';

interface PossiblePathsPanelProps {
  readonly numColumns: number;
  readonly possiblePaths: readonly LostTemplePath[];
  readonly openRooms: ReadonlySet<string>;
  readonly openDoors: ReadonlySet<string>;
}

// TODO: add empty state

// TODO: make this dynamic based on screen size
const panelWidth = 600;

function PossiblePathsPanel({
  numColumns,
  possiblePaths,
  openRooms,
  openDoors,
}: PossiblePathsPanelProps) {
  const { t } = useTranslation();
  const columnWidth =
    (panelWidth - 2 * sidePanelPadding - (numColumns - 1) * gridPadding) / numColumns;
  const filteredCount = possiblePaths.reduce((p, c) => p + c.count, 0);
  const lostTemplePaths = possiblePaths.map((p) => {
    // TODO: use a unique ID (i.e. the index in the raw data list)
    const key = Array.from(p.openDoors).sort().join('|');
    const knownRooms = intersection(p.openRooms, openRooms);
    const knownDoors = intersection(p.openDoors, openDoors);
    return (
      <ItemContainer key={key}>
        <LostTemple
          size={columnWidth}
          openRooms={p.openRooms}
          openDoors={p.openDoors}
          knownRooms={knownRooms}
          knownDoors={knownDoors}
          showRoomNames={false}
        />
        <Typography variant="body1">
          {`${p.count} / ${filteredCount} (${Math.round((p.count / filteredCount) * 1000) / 10}%)`}
        </Typography>
      </ItemContainer>
    );
  });
  const length = possiblePaths.length;
  const possiblePathKey = length === 1 ? 'possiblePaths_one' : 'possiblePaths_other';
  const possiblePathText = t(possiblePathKey, { count: length });
  return (
    <SidePanel
      sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block', xl: 'block' } }}
      width={panelWidth}
      elevation={4}
    >
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
const gridPadding = 24;

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
