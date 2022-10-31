import React from 'react';
import { LostTemplePath } from '../scripts/lostTemplePath';
import LostTemple from './LostTemple';
import { styled } from '@mui/material/styles';
import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

// TODO: make this dynamic based on screen size
const panelWidthXL = 720;
const panelWidthL = 600;

interface PossiblePathsPanelProps {
  readonly numColumns: number;
  readonly possiblePaths: readonly LostTemplePath[];
}

function PossiblePathsPanel({ numColumns, possiblePaths }: PossiblePathsPanelProps) {
  const { t } = useTranslation();
  const columnWidth =
    (panelWidthL - 2 * sidePanelPadding - (numColumns - 1) * gridPadding) / numColumns;
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
  const possiblePathKey = length === 1 ? 'possiblePaths_one' : 'possiblePaths_other';
  const possiblePathText = t(possiblePathKey, { count: length });
  return (
    <SidePanel sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'block' } }} elevation={4}>
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

const SidePanel = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('xl')]: {
    width: panelWidthL,
  },
  [theme.breakpoints.up('xl')]: {
    width: panelWidthXL,
  },
  overflowY: 'auto',
  boxSizing: 'border-box',
  // height: 100vh;
  // padding: ${sidePanelPadding}px;
  // box-sizing: border-box;
  // overflow-y: auto;
}));

const ColumnContainer = styled('div')`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const GridContainer = styled('div')<{
  readonly columnWidth: number;
  readonly numColumns: number;
}>`
  width: 100%;
  display: grid;
  grid-template-columns: ${({ columnWidth, numColumns }) => toCssValue(columnWidth, numColumns)};
  grid-gap: ${gridPadding}px;
`;

const ItemContainer = styled('div')`
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
