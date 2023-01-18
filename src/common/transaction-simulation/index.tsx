import React from 'react';
import styled from 'styled-components';
import SendIcon from '@mui/icons-material/Send';
import { BlowfishResponse, StateChangeKind } from 'types';
import Typography from '@mui/material/Typography';

const StyledTransactionSimulationsContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const StyledTransactionSimulations = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTransactionSimulation = styled.div`
  display: flex;
  gap: 24px;
  padding: 0px;
`;

const StyledTransactionSimulationIcon = styled.div<{ isFirst: boolean; isLast: boolean }>`
  display: flex;
  position: relative;
  padding-top: 10px;
  padding-bottom: 10px;
  &:after {
    content: '';
    position: absolute;
    left: calc(50% - 1px);
    top: 0px;
    right: 0px;
    bottom: 0;
    border-left: 1px dashed rgba(255, 255, 255, 0.5);
    ${({ isFirst }) => (isFirst ? 'top: 24px;' : '')}
    ${({ isLast }) => (isLast ? 'bottom: calc(100% - 24px);' : '')}
  }
`;

const StyledTransactionSimulationIconContent = styled.div`
  display: flex;
  align-self: flex-start;
`;

const StyledTransactionSimulationContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const TYPE_ICONS: Record<StateChangeKind, React.ReactElement> = {
  [StateChangeKind.ERC20_TRANSFER]: <SendIcon />,
  [StateChangeKind.ERC1155_APPROVAL_FOR_ALL]: <SendIcon />,
  [StateChangeKind.ERC1155_TRANSFER]: <SendIcon />,
  [StateChangeKind.ERC20_APPROVAL]: <SendIcon />,
  [StateChangeKind.ERC721_APPROVAL]: <SendIcon />,
  [StateChangeKind.ERC721_APPROVAL_FOR_ALL]: <SendIcon />,
  [StateChangeKind.ERC721_TRANSFER]: <SendIcon />,
  [StateChangeKind.NATIVE_ASSET_TRANSFER]: <SendIcon />,
};

interface ItemProps {
  isLast: boolean;
  isFirst: boolean;
  humanReadableDiff: string;
  rawInfo: {
    kind: StateChangeKind;
    data: unknown;
  };
}

const buildItem = ({ isLast, isFirst, humanReadableDiff, rawInfo: { kind } }: ItemProps) => ({
  content: () => (
    <>
      <StyledTransactionSimulationIcon isLast={isLast} isFirst={isFirst}>
        <StyledTransactionSimulationIconContent>{TYPE_ICONS[kind]}</StyledTransactionSimulationIconContent>
      </StyledTransactionSimulationIcon>
      <StyledTransactionSimulationContent>
        <Typography variant="body1">{humanReadableDiff}</Typography>
      </StyledTransactionSimulationContent>
    </>
  ),
});

interface TransactionSimulationProps {
  items: BlowfishResponse;
}

const ITEMS_MAP: Record<StateChangeKind, (props: ItemProps) => { content: () => JSX.Element }> = {
  [StateChangeKind.ERC20_TRANSFER]: buildItem,
  [StateChangeKind.ERC1155_APPROVAL_FOR_ALL]: buildItem,
  [StateChangeKind.ERC1155_TRANSFER]: buildItem,
  [StateChangeKind.ERC20_APPROVAL]: buildItem,
  [StateChangeKind.ERC721_APPROVAL]: buildItem,
  [StateChangeKind.ERC721_APPROVAL_FOR_ALL]: buildItem,
  [StateChangeKind.ERC721_TRANSFER]: buildItem,
  [StateChangeKind.NATIVE_ASSET_TRANSFER]: buildItem,
};

const TransactionSimulation = ({ items }: TransactionSimulationProps) => (
  <StyledTransactionSimulationsContainer>
    <StyledTransactionSimulations>
      {items.simulationResults.expectedStateChanges.map((simulation, index) => {
        const isFirst = index === 0;
        const isLast = index + 1 === items.simulationResults.expectedStateChanges.length;

        const item = ITEMS_MAP[simulation.rawInfo.kind]({
          isFirst,
          isLast,
          ...simulation,
        });
        return (
          <StyledTransactionSimulation key={index}>
            <item.content />
          </StyledTransactionSimulation>
        );
      })}
    </StyledTransactionSimulations>
  </StyledTransactionSimulationsContainer>
);

export default TransactionSimulation;
