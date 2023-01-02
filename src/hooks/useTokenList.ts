import React from 'react';
import { TokenList } from 'types';
import reduce from 'lodash/reduce';
import keyBy from 'lodash/keyBy';
import { ALLOWED_YIELDS } from 'config/constants';
import { getProtocolToken, PROTOCOL_TOKEN_ADDRESS } from 'mocks/tokens';
import { useSavedAggregatorTokenLists, useTokensLists } from 'state/token-lists/hooks';
import useCurrentNetwork from './useCurrentNetwork';

const BLACKLIST = [
  '0x5fe2b58c013d7601147dcdd68c143a77499f5531',
  '0x50b728d8d964fd00c2d0aad81718b71311fef68a',
  '0x65559aa14915a70190438ef90104769e5e890a00', // OE - ENS
];

function useTokenList(isAggregator = false, filter = true) {
  const currentNetwork = useCurrentNetwork();
  const tokensLists = useTokensLists();
  const savedDCATokenLists = ['Mean Finance Graph Allowed Tokens'];
  const savedAggregatorTokenLists = useSavedAggregatorTokenLists();

  const savedTokenLists = isAggregator ? savedAggregatorTokenLists : savedDCATokenLists;
  const reducedYieldTokens = React.useMemo(
    () =>
      ALLOWED_YIELDS[currentNetwork.chainId].reduce(
        (acc, yieldOption) => [...acc, yieldOption.tokenAddress.toLowerCase()],
        []
      ),
    [currentNetwork.chainId]
  );

  const tokenList: TokenList = React.useMemo(
    () =>
      reduce(
        tokensLists,
        (acc, tokensList, key) =>
          !filter || savedTokenLists.includes(key)
            ? {
                ...acc,
                ...keyBy(
                  tokensList.tokens.filter(
                    (token) =>
                      token.chainId === currentNetwork.chainId &&
                      !Object.keys(acc).includes(token.address) &&
                      (isAggregator || !reducedYieldTokens.includes(token.address)) &&
                      (!filter || !BLACKLIST.includes(token.address))
                  ),
                  'address'
                ),
              }
            : acc,
        { [PROTOCOL_TOKEN_ADDRESS]: getProtocolToken(currentNetwork.chainId) }
      ),
    [currentNetwork.chainId, savedTokenLists, reducedYieldTokens, filter, isAggregator]
  );

  return tokenList;
}

export default useTokenList;
