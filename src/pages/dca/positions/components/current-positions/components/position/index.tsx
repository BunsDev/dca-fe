import * as React from 'react';
import find from 'lodash/find';
import Card from '@mui/material/Card';
import findIndex from 'lodash/findIndex';
import { DateTime } from 'luxon';
import LinearProgress from '@mui/material/LinearProgress';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import styled from 'styled-components';
import { defineMessage, FormattedMessage, useIntl } from 'react-intl';
import TokenIcon from '@common/components/token-icon';
import {
  getTimeFrequencyLabel,
  calculateStale,
  STALE,
  calculateYield,
  sortTokensByAddress,
} from '@common/utils/parsing';
import { ChainId, Position, Token, YieldOptions } from '@types';
import { NETWORKS, STRING_SWAP_INTERVALS, SWAP_INTERVALS_MAP, VERSIONS_ALLOWED_MODIFY } from '@constants';
import useAvailablePairs from '@hooks/useAvailablePairs';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { createStyles } from '@mui/material/styles';
import { withStyles } from '@mui/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { BigNumber } from 'ethers';
import { emptyTokenWithAddress, formatCurrencyAmount } from '@common/utils/currency';
import { getWrappedProtocolToken, PROTOCOL_TOKEN_ADDRESS } from '@common/mocks/tokens';
import ComposedTokenIcon from '@common/components/composed-token-icon';
import CustomChip from '@common/components/custom-chip';
import { Link, Theme, Tooltip } from '@mui/material';
import useUsdPrice from '@hooks/useUsdPrice';
import PositionControls from '../position-controls';

const StyledSwapsLinearProgress = styled(LinearProgress)<{ swaps: number }>``;

const DarkTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

const BorderLinearProgress = withStyles(() =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 10,
      background: '#D8D8D8',
    },
    bar: {
      borderRadius: 10,
      background: 'linear-gradient(90deg, #3076F6 0%, #B518FF 123.4%)',
    },
  })
)(StyledSwapsLinearProgress);

const StyledNetworkLogoContainer = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  border-radius: 30px;
  border: 3px solid #1b1923;
  width: 32px;
  height: 32px;
`;

const StyledCard = styled(Card)`
  border-radius: 10px;
  position: relative;
  display: flex;
  flex-grow: 1;
  background: #292929;
  overflow: visible;
`;

const StyledCardContent = styled(CardContent)`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const StyledCardHeader = styled.div`
  display: flex;
  margin-bottom: 5px;
  flex-wrap: wrap;
`;

const StyledArrowRightContainer = styled.div`
  margin: 0 5px !important;
  font-size: 35px;
  display: flex;
`;

const StyledCardTitleHeader = styled.div`
  display: flex;
  align-items: center;
  margin-right: 10px;
  flex-grow: 1;
  *:not(:first-child) {
    margin-left: 4px;
    font-weight: 500;
  }
`;

const StyledLink = styled(Link)`
  margin: 0px 5px;
  ${({ theme }) => `
    color: ${theme.palette.mode === 'light' ? '#3f51b5' : '#8699ff'}
  `}
`;

const StyledDetailWrapper = styled.div<{ alignItems?: string; flex?: boolean; $spacing?: boolean }>`
  margin-bottom: 5px;
  display: flex;
  align-items: ${({ alignItems }) => alignItems || 'center'};
  justify-content: flex-start;
  ${({ flex }) => (flex ? 'flex: 1;' : '')}
  ${({ $spacing }) => ($spacing ? 'margin-top: 10px;' : '')}
  gap: 5px;
  flex-wrap: wrap;
`;

const StyledProgressWrapper = styled.div`
  margin: 12px 0px;
`;

const StyledFreqLeft = styled.div`
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledStale = styled.div`
  color: #cc6d00;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledDeprecated = styled.div`
  color: #cc6d00;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledFinished = styled.div`
  color: #33ac2e;
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

interface PositionProp extends Omit<Position, 'from' | 'to'> {
  from: Token;
  to: Token;
}

interface ActivePositionProps {
  position: PositionProp;
  onWithdraw: (position: Position, useProtocolToken?: boolean) => void;
  onReusePosition: (position: Position) => void;
  onMigrateYield: (position: Position) => void;
  onTerminate: (position: Position) => void;
  onSuggestMigrateYield: (position: Position) => void;
  disabled: boolean;
  hasSignSupport: boolean;
  yieldOptionsByChain: Record<ChainId, YieldOptions>;
}

const ActivePosition = ({
  position,
  onWithdraw,
  onReusePosition,
  onMigrateYield,
  onSuggestMigrateYield,
  disabled,
  hasSignSupport,
  onTerminate,
  yieldOptionsByChain,
}: ActivePositionProps) => {
  const {
    from,
    to,
    swapInterval,
    remainingLiquidity: remainingLiquidityRaw,
    remainingSwaps,
    rate,
    depositedRateUnderlying,
    totalSwaps,
    pendingTransaction,
    toWithdraw: rawToWithdraw,
    toWithdrawUnderlying,
    remainingLiquidityUnderlying,
    toWithdrawUnderlyingAccum,
    chainId,
  } = position;
  const positionNetwork = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const supportedNetwork = find(NETWORKS, { chainId })!;
    return supportedNetwork;
  }, [chainId]);
  const yieldOptions = yieldOptionsByChain[chainId];

  const availablePairs = useAvailablePairs();

  const rateToUse = depositedRateUnderlying || rate;
  const intl = useIntl();

  const toWithdraw = toWithdrawUnderlying || rawToWithdraw;
  const toWithdrawYield =
    toWithdrawUnderlyingAccum && toWithdrawUnderlying
      ? toWithdrawUnderlying.sub(toWithdrawUnderlyingAccum)
      : BigNumber.from(0);
  const toWithdrawBase = toWithdraw.sub(toWithdrawYield);

  const { yieldGenerated: yieldFromGenerated, base: remainingLiquidity } = calculateYield(
    remainingLiquidityUnderlying || BigNumber.from(remainingLiquidityRaw),
    rateToUse,
    remainingSwaps
  );
  const intervalIndex = findIndex(SWAP_INTERVALS_MAP, { value: swapInterval });

  const [toPrice, isLoadingToPrice] = useUsdPrice(to, toWithdrawBase, undefined, chainId);
  const [toYieldPrice, isLoadingToYieldPrice] = useUsdPrice(to, toWithdrawYield, undefined, chainId);
  const [ratePrice, isLoadingRatePrice] = useUsdPrice(from, rateToUse, undefined, chainId);
  const [fromPrice, isLoadingFromPrice] = useUsdPrice(from, remainingLiquidity, undefined, chainId);
  const [fromYieldPrice, isLoadingFromYieldPrice] = useUsdPrice(from, yieldFromGenerated, undefined, chainId);

  const showToPrice = !isLoadingToPrice && !!toPrice;
  const showToYieldPrice = !isLoadingToYieldPrice && !!toYieldPrice;
  const showRatePrice = !isLoadingRatePrice && !!ratePrice;
  const showFromPrice = !isLoadingFromPrice && !!fromPrice;
  const showFromYieldPrice = !isLoadingFromYieldPrice && !!fromYieldPrice;

  const isPending = !!pendingTransaction;
  const wrappedProtocolToken = getWrappedProtocolToken(positionNetwork.chainId);

  const pair = React.useMemo(() => {
    if (!from || !to) return undefined;
    const tokenA =
      (from.underlyingTokens[0] && from.underlyingTokens[0].address) ||
      (from.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : from.address);
    const tokenB =
      (to.underlyingTokens[0] && to.underlyingTokens[0].address) ||
      (to.address === PROTOCOL_TOKEN_ADDRESS ? wrappedProtocolToken.address : to.address);

    const [pairToken0, pairToken1] = sortTokensByAddress(tokenA, tokenB);

    return find(
      availablePairs,
      (currentPair) =>
        currentPair.token0.address === pairToken0.toLocaleLowerCase() &&
        currentPair.token1.address === pairToken1.toLocaleLowerCase()
    );
  }, [from, to, availablePairs]);

  const hasNoFunds = remainingLiquidity.lte(BigNumber.from(0));

  const isStale =
    calculateStale(
      pair?.lastExecutedAt || position.pairLastSwappedAt || 0,
      swapInterval,
      position.startedAt,
      pair?.swapInfo
    ) === STALE;

  const isOldVersion = !VERSIONS_ALLOWED_MODIFY.includes(position.version);

  const foundYieldFrom =
    position.from.underlyingTokens[0] &&
    find(yieldOptions, { tokenAddress: position.from.underlyingTokens[0].address });
  const foundYieldTo =
    position.to.underlyingTokens[0] && find(yieldOptions, { tokenAddress: position.to.underlyingTokens[0].address });

  return (
    <StyledCard variant="outlined">
      {positionNetwork && (
        <StyledNetworkLogoContainer>
          <TokenIcon size="26px" token={emptyTokenWithAddress(positionNetwork.mainCurrency || '')} />
        </StyledNetworkLogoContainer>
      )}
      <StyledCardContent>
        <StyledContentContainer>
          <StyledCardHeader>
            <StyledCardTitleHeader>
              <TokenIcon token={from} size="27px" />
              <Typography variant="body1">{from.symbol}</Typography>
              <StyledArrowRightContainer>
                <ArrowRightAltIcon fontSize="inherit" />
              </StyledArrowRightContainer>
              <TokenIcon token={to} size="27px" />
              <Typography variant="body1">{to.symbol}</Typography>
            </StyledCardTitleHeader>
            {!isPending && !hasNoFunds && !isStale && (
              <StyledFreqLeft>
                <Typography variant="caption">
                  <FormattedMessage
                    description="days to finish"
                    defaultMessage="{type} left"
                    values={{
                      type: getTimeFrequencyLabel(intl, swapInterval.toString(), remainingSwaps.toString()),
                    }}
                  />
                </Typography>
              </StyledFreqLeft>
            )}
            {!isPending && hasNoFunds && !isOldVersion && (
              <StyledFinished>
                <Typography variant="caption">
                  <FormattedMessage description="finishedPosition" defaultMessage="FINISHED" />
                </Typography>
              </StyledFinished>
            )}
            {!isPending && !hasNoFunds && isStale && !isOldVersion && (
              <StyledStale>
                <Typography variant="caption">
                  <FormattedMessage description="stale" defaultMessage="STALE" />
                </Typography>
              </StyledStale>
            )}
            {isOldVersion && hasNoFunds && (
              <StyledDeprecated>
                <Typography variant="caption">
                  <FormattedMessage description="deprecated" defaultMessage="DEPRECATED" />
                </Typography>
              </StyledDeprecated>
            )}
          </StyledCardHeader>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="current remaining"
                defaultMessage="Remaining:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip
              tooltip={showFromPrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showFromPrice ? fromPrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
            >
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(remainingLiquidity), position.from, 4)}
              </Typography>
            </CustomChip>
            {yieldFromGenerated.gt(BigNumber.from(0)) && (
              <>
                +
                <CustomChip
                  tooltip={showFromYieldPrice}
                  tooltipTitle={
                    <FormattedMessage
                      description="current swapped in position price"
                      defaultMessage="~ {fromPrice} USD"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        fromPrice: showFromYieldPrice ? fromYieldPrice?.toFixed(2) : 0,
                      }}
                    />
                  }
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom?.token}
                      tokenBottom={position.from}
                    />
                  }
                >
                  <Typography variant="body2">
                    {formatCurrencyAmount(BigNumber.from(yieldFromGenerated), position.from, 4)}
                  </Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          <StyledDetailWrapper alignItems="flex-start">
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage
                description="current rate remaining"
                defaultMessage="Rate:"
                values={{
                  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                }}
              />
            </Typography>
            <CustomChip
              tooltip={showRatePrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showRatePrice ? ratePrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.from} />}
            >
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(rateToUse), position.from, 4)}
              </Typography>
            </CustomChip>
            <FormattedMessage
              description="positionDetailsCurrentRate"
              defaultMessage="{frequency} {hasYield}"
              values={{
                b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                hasYield: position.from.underlyingTokens.length
                  ? intl.formatMessage(
                      defineMessage({
                        defaultMessage: '+ yield',
                        description: 'plusYield',
                      })
                    )
                  : '',
                frequency: intl.formatMessage(
                  STRING_SWAP_INTERVALS[position.swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].adverb
                ),
              }}
            />
          </StyledDetailWrapper>
          <StyledDetailWrapper>
            <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
              <FormattedMessage description="positionDetailsToWithdrawTitle" defaultMessage="To withdraw: " />
            </Typography>
            <CustomChip
              tooltip={showToPrice}
              tooltipTitle={
                <FormattedMessage
                  description="current swapped in position price"
                  defaultMessage="~ {fromPrice} USD"
                  values={{
                    b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                    fromPrice: showToPrice ? toPrice?.toFixed(2) : 0,
                  }}
                />
              }
              icon={<ComposedTokenIcon isInChip size="16px" tokenBottom={position.to} />}
            >
              <Typography variant="body2">
                {formatCurrencyAmount(BigNumber.from(toWithdrawBase), position.to, 4)}
              </Typography>
            </CustomChip>
            {toWithdrawYield.gt(BigNumber.from(0)) && (
              <>
                +
                {/* <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
                  <FormattedMessage description="plusYield" defaultMessage="+ yield" />
                </Typography> */}
                <CustomChip
                  tooltip={showToYieldPrice}
                  tooltipTitle={
                    <FormattedMessage
                      description="current swapped in position price"
                      defaultMessage="~ {fromPrice} USD"
                      values={{
                        b: (chunks: React.ReactNode) => <b>{chunks}</b>,
                        fromPrice: showToYieldPrice ? toYieldPrice?.toFixed(2) : 0,
                      }}
                    />
                  }
                  icon={
                    <ComposedTokenIcon isInChip size="16px" tokenTop={foundYieldTo?.token} tokenBottom={position.to} />
                  }
                >
                  <Typography variant="body2">{formatCurrencyAmount(toWithdrawYield, position.to, 4)}</Typography>
                </CustomChip>
              </>
            )}
          </StyledDetailWrapper>
          {remainingSwaps.gt(BigNumber.from(0)) && !!pair?.nextSwapAvailableAt[intervalIndex] && (
            <StyledDetailWrapper>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage description="positionDetailsNextSwapTitle" defaultMessage="Next swap: " />
              </Typography>
              {DateTime.now().toSeconds() <
                DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toSeconds() && (
                <DarkTooltip
                  title={DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toLocaleString(
                    DateTime.DATETIME_FULL_WITH_SECONDS
                  )}
                  arrow
                  placement="top"
                >
                  <Typography variant="body1">
                    {DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toRelative()}
                  </Typography>
                </DarkTooltip>
              )}
              {DateTime.now().toSeconds() >
                DateTime.fromSeconds(pair.nextSwapAvailableAt[intervalIndex]).toSeconds() && (
                <DarkTooltip
                  title={
                    <FormattedMessage
                      description="positionDetailsNextSwapInProgressTooltip"
                      defaultMessage="Market Makers should execute your swap anytime now"
                    />
                  }
                  arrow
                  placement="top"
                >
                  <Typography variant="body1">
                    <FormattedMessage description="positionDetailsNextSwapInProgress" defaultMessage="in progress" />
                  </Typography>
                </DarkTooltip>
              )}
            </StyledDetailWrapper>
          )}
          {!foundYieldFrom && !foundYieldTo && (
            <StyledDetailWrapper alignItems="flex-start" $spacing>
              <Typography variant="body1" color="rgba(255, 255, 255, 0.5)">
                <FormattedMessage
                  description="positionNotGainingInterest"
                  defaultMessage="Position not generating yield"
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {(foundYieldFrom || foundYieldTo) && (
            <StyledDetailWrapper alignItems="flex-start" flex $spacing>
              {foundYieldFrom && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon
                      isInChip
                      size="16px"
                      tokenTop={foundYieldFrom.token}
                      tokenBottom={position.from}
                    />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.from.symbol,
                        apy: parseFloat(foundYieldFrom.apy.toFixed(2)).toString(),
                        platform: foundYieldFrom.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {parseFloat(foundYieldFrom.apy.toFixed(2)).toString()}%
                  </Typography>
                </CustomChip>
              )}
              {foundYieldTo && (
                <CustomChip
                  icon={
                    <ComposedTokenIcon isInChip size="16px" tokenTop={foundYieldTo.token} tokenBottom={position.to} />
                  }
                  tooltip
                  tooltipTitle={
                    <FormattedMessage
                      description="generatingYieldAt"
                      defaultMessage="Generating {token} at {platform} with {apy}% APY"
                      values={{
                        token: position.to.symbol,
                        apy: parseFloat(foundYieldTo.apy.toFixed(2)).toString(),
                        platform: foundYieldTo.name,
                      }}
                    />
                  }
                >
                  <Typography variant="body2" fontWeight={500}>
                    APY {parseFloat(foundYieldTo.apy.toFixed(2)).toString()}%
                  </Typography>
                </CustomChip>
              )}
            </StyledDetailWrapper>
          )}
          {((position.from.symbol === 'CRV' && foundYieldFrom) || (position.to.symbol === 'CRV' && foundYieldTo)) && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" color="#db9e00" sx={{ display: 'flex', flex: '1' }}>
                <FormattedMessage
                  description="positionCRVNotSupported"
                  defaultMessage="Unfortunately, the CRV token can no longer be used as collateral on Aave V3. This means that it's not possible to swap this position."
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {(position.from.symbol === 'UNIDX' || position.to.symbol === 'UNIDX') && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" color="#db9e00" sx={{ display: 'flex', flex: '1' }}>
                <FormattedMessage
                  description="positionUNIDXNotSupported"
                  defaultMessage="$UNIDX liquidity has been moved out of Uniswap, thus rendering the oracle unreliable. Swaps have been paused until a reliable oracle for $UNIDX is available"
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'LPT' && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" color="#db9e00" sx={{ display: 'flex', flex: '1' }}>
                <FormattedMessage
                  description="positionLPTNotSupported"
                  defaultMessage="Livepeer liquidity on Arbitrum has decreased significantly, so adding funds is disabled until this situation has reverted."
                />
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'jEUR' && foundYieldFrom && (
            <StyledDetailWrapper alignItems="flex-start">
              <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                <ErrorOutlineIcon fontSize="inherit" />
              </Typography>
              <Typography variant="caption" color="#db9e00" sx={{ display: 'flex', flex: '1' }}>
                <FormattedMessage
                  description="positionJEURNotSupported"
                  defaultMessage="Due to the latest developments Aave has paused the $jEUR lending and borrowing. As a result, increasing the position has been disabled. Read more about this here"
                />
                <StyledLink href="https://app.aave.com/governance/proposal/?proposalId=143" target="_blank">
                  <FormattedMessage description="here" defaultMessage="here." />
                </StyledLink>
              </Typography>
            </StyledDetailWrapper>
          )}
          {position.from.symbol === 'agEUR' ||
            (position.to.symbol === 'agEUR' && (
              <StyledDetailWrapper alignItems="flex-start">
                <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                  <ErrorOutlineIcon fontSize="inherit" />
                </Typography>
                <Typography variant="caption" color="#db9e00" sx={{ display: 'flex', flex: '1' }}>
                  <FormattedMessage
                    description="positionagEURNotSupported"
                    defaultMessage="Due to Euler's security breach, the Angle protocol has been paused. As a consequence, oracles and swaps cannot operate reliably and have been halted."
                  />
                </Typography>
              </StyledDetailWrapper>
            ))}
          {(!!position.from.underlyingTokens.length || !!position.to.underlyingTokens.length) &&
            position.chainId === 1 && (
              <StyledDetailWrapper alignItems="flex-start">
                <Typography variant="body2" color="#db9e00" sx={{ display: 'flex', marginTop: '2px' }}>
                  <ErrorOutlineIcon fontSize="inherit" />
                </Typography>
                <Typography variant="caption" color="#db9e00" sx={{ flex: '1' }}>
                  <FormattedMessage
                    description="positionEulerHack1"
                    defaultMessage="Euler has frozen the contracts after the hack, so modifying positions or withdrawing is not possible at the moment. You might be entitled to claim compensation, to do this visit the"
                  />
                  <StyledLink href="https://mean.finance/euler-claim" target="_blank">
                    <FormattedMessage description="EulerClaim ClaimPage" defaultMessage="claim page" />
                  </StyledLink>
                </Typography>
              </StyledDetailWrapper>
            )}
        </StyledContentContainer>
        {remainingSwaps.toNumber() > 0 && (
          <DarkTooltip
            title={
              <FormattedMessage
                description="executedSwapsTooltip"
                defaultMessage="Executed {executedSwaps}/{totalSwaps} swaps"
                values={{
                  executedSwaps: position.totalExecutedSwaps.toString(),
                  totalSwaps: position.totalSwaps.toString(),
                }}
              />
            }
            arrow
            placement="top"
          >
            <StyledProgressWrapper>
              <BorderLinearProgress
                swaps={remainingSwaps.toNumber()}
                variant="determinate"
                value={100 * ((totalSwaps.toNumber() - remainingSwaps.toNumber()) / totalSwaps.toNumber())}
              />
            </StyledProgressWrapper>
          </DarkTooltip>
        )}
        <PositionControls
          position={position}
          onTerminate={onTerminate}
          onWithdraw={onWithdraw}
          onReusePosition={onReusePosition}
          onMigrateYield={onMigrateYield}
          disabled={disabled}
          hasSignSupport={!!hasSignSupport}
          yieldOptions={yieldOptions}
          onSuggestMigrateYield={onSuggestMigrateYield}
        />
      </StyledCardContent>
    </StyledCard>
  );
};
export default ActivePosition;
