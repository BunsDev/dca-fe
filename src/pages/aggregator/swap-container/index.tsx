import * as React from 'react';
import Grid from '@mui/material/Grid';
import find from 'lodash/find';
import { getProtocolToken } from '@common/mocks/tokens';
import useSelectedNetwork from '@hooks/useSelectedNetwork';
import { NETWORKS, REMOVED_AGG_CHAINS } from '@constants';
import { useAggregatorState } from '@state/aggregator/hooks';
import { useAppDispatch } from '@state/hooks';
import { setFrom, setTo, setSelectedRoute, setAggregatorChainId } from '@state/aggregator/actions';
import useSwapOptions from '@hooks/useSwapOptions';
import useCustomToken from '@hooks/useCustomToken';
import { useParams } from 'react-router-dom';
import useToken from '@hooks/useToken';
import useSwapOption from '@hooks/useSwapOption';
import useCurrentNetwork from '@hooks/useCurrentNetwork';
import { useAggregatorSettingsState } from '@state/aggregator-settings/hooks';
import useSdkMappedChains from '@hooks/useMappedSdkChains';
import AggregatorFAQ from './components/faq';
import Swap from './components/swap';
import SwapQuotes from './components/quotes';

const SwapContainer = () => {
  const { fromValue, from, to, toValue, isBuyOrder, selectedRoute, transferTo } = useAggregatorState();
  const { slippage, gasSpeed, disabledDexes, sorting } = useAggregatorSettingsState();
  const dispatch = useAppDispatch();
  const currentNetwork = useSelectedNetwork();
  const { from: fromParam, to: toParam, chainId } = useParams<{ from: string; to: string; chainId: string }>();
  const fromParamToken = useToken(fromParam, true, true);
  const toParamToken = useToken(toParam, true, true);
  const actualCurrentNetwork = useCurrentNetwork();
  const [fromParamCustomToken] = useCustomToken(fromParam, !!fromParamToken);
  const [toParamCustomToken] = useCustomToken(toParam, !!toParamToken);
  const sdkMappedNetworks = useSdkMappedChains();

  const [swapOptions, isLoadingSwapOptions, swapOptionsError, fetchOptions] = useSwapOptions(
    from,
    to,
    isBuyOrder ? toValue : fromValue,
    isBuyOrder,
    sorting,
    transferTo,
    parseFloat(slippage),
    gasSpeed,
    disabledDexes
  );
  const [swapOption, isLoadingSwapOption] = useSwapOption(selectedRoute, transferTo, parseFloat(slippage), gasSpeed);

  const [refreshQuotes, setRefreshQuotes] = React.useState(true);

  const mappedNetworks = React.useMemo(
    () => sdkMappedNetworks.filter((network) => !REMOVED_AGG_CHAINS.includes(network?.chainId || -1)),
    [sdkMappedNetworks]
  );

  React.useEffect(() => {
    let networkToSet = find(mappedNetworks, { chainId: Number(chainId) });
    if (!networkToSet && chainId) {
      networkToSet = find(mappedNetworks, { name: chainId.toLowerCase() });
    }
    dispatch(
      setAggregatorChainId(Number(networkToSet?.chainId || actualCurrentNetwork.chainId || NETWORKS.mainnet.chainId))
    );
  }, [mappedNetworks]);

  React.useEffect(() => {
    if (fromParamToken) {
      dispatch(setFrom(fromParamToken));
    } else if (fromParamCustomToken && !from) {
      dispatch(setFrom(fromParamCustomToken.token));
    } else if (!from && !to && !toParamToken && !toParamCustomToken) {
      let networkToUse = find(mappedNetworks, { chainId: Number(chainId) });
      if (!networkToUse && chainId) {
        networkToUse = find(mappedNetworks, { name: chainId.toLowerCase() });
      }
      dispatch(
        setFrom(
          getProtocolToken(Number(networkToUse?.chainId || actualCurrentNetwork.chainId || currentNetwork.chainId))
        )
      );
    }

    if (toParamToken) {
      dispatch(setTo(toParamToken));
    } else if (toParamCustomToken && !to) {
      dispatch(setTo(toParamCustomToken.token));
    }
  }, [currentNetwork.chainId, fromParamCustomToken, toParamCustomToken]);

  React.useEffect(() => {
    if (!isLoadingSwapOptions && swapOptions && swapOptions.length && !swapOption) {
      dispatch(setSelectedRoute(swapOptions[0]));
    }

    if (!isLoadingSwapOption && swapOption && swapOption.id !== selectedRoute?.id) {
      dispatch(setSelectedRoute(swapOption));
    }
  }, [isLoadingSwapOptions, swapOption, isLoadingSwapOption, sorting]);

  return (
    <Grid container spacing={2} alignItems="flex-start" justifyContent="space-around" alignSelf="flex-start">
      <Grid item xs={12} md={5}>
        <Swap isLoadingRoute={isLoadingSwapOptions || isLoadingSwapOption} setRefreshQuotes={setRefreshQuotes} />
      </Grid>
      <Grid item xs={12} md={7} style={{ flexGrow: 1, alignSelf: 'stretch', display: 'flex' }}>
        <Grid container spacing={2} alignItems="stretch" justify-content="center">
          <Grid item xs={12} sx={{ display: 'flex' }}>
            <SwapQuotes
              quotes={(selectedRoute && swapOptions) || []}
              isLoading={isLoadingSwapOptions}
              fetchOptions={fetchOptions}
              refreshQuotes={refreshQuotes}
              bestQuote={swapOptions?.[0]}
              swapOptionsError={swapOptionsError}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <AggregatorFAQ />
      </Grid>
    </Grid>
  );
};
export default SwapContainer;
