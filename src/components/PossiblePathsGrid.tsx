import React from 'react';
import { LostTemplePath } from '../scripts/lostTemplePath';
import LostTemple from './LostTemple';
import { getOpenRooms } from './App';
import styled from '@emotion/styled';

interface PossiblePathsGridProps {
  readonly possiblePaths: readonly LostTemplePath[];
}

function PossiblePathsGrid({ possiblePaths }: PossiblePathsGridProps) {
  const lostTemplePaths = possiblePaths.map((p) => {
    // TODO: confirm this key is correct
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
    <Container>
      {possiblePathText}
      <GridContainer>{lostTemplePaths}</GridContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const GridContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 600px;
`;

export default PossiblePathsGrid;
