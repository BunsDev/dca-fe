import React from 'react';
import find from 'lodash/find';
import { TransactionDetails, Position, TransactionTypes } from '@types';
import { STRING_SWAP_INTERVALS } from '@constants';
import useAvailablePairs from '@hooks/useAvailablePairs';
import { formatCurrencyAmount } from '@common/utils/currency';
import { BigNumber } from 'ethers';
import { defineMessage, useIntl } from 'react-intl';
import { getWrappedProtocolToken } from '@common/mocks/tokens';
import { getFrequencyLabel } from '@common/utils/parsing';
import useCurrentPositions from './useCurrentPositions';
import usePastPositions from './usePastPositions';

function useBuildTransactionMessages() {
  const availablePairs = useAvailablePairs();
  const currentPositions = useCurrentPositions();
  const pastPositions = usePastPositions();
  const intl = useIntl();

  const positions = React.useMemo(() => [...pastPositions, ...currentPositions], [currentPositions, pastPositions]);

  return React.useCallback(
    (tx: TransactionDetails) => {
      let message = intl.formatMessage(
        defineMessage({
          description: 'transactionMessagesConfirmed',
          defaultMessage: 'Transaction confirmed!',
        })
      );
      switch (tx.type) {
        case TransactionTypes.wrap: {
          const swapTypeData = tx.typeData;

          message = `Wrapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TransactionTypes.unwrap: {
          const swapTypeData = tx.typeData;

          message = `Unwrapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TransactionTypes.swap: {
          const swapTypeData = tx.typeData;

          message = `Swapped ${swapTypeData.amountFrom} ${swapTypeData.from} for ${swapTypeData.amountTo} ${swapTypeData.to}`;
          break;
        }
        case TransactionTypes.wrapEther: {
          const wrapEtherTypeData = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesWrap',
              defaultMessage: '{amount} wrapped to {token}',
            }),
            {
              amount: wrapEtherTypeData.amount,
              token: getWrappedProtocolToken(tx.chainId).symbol,
            }
          );
          break;
        }
        case TransactionTypes.newPosition: {
          const newPositionTypeData = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesNewPosition',
              defaultMessage: 'Your new {from}:{to} position has been created',
            }),
            {
              from: newPositionTypeData.from.symbol,
              to: newPositionTypeData.to.symbol,
            }
          );
          break;
        }
        case TransactionTypes.terminatePosition: {
          const terminatePositionTypeData = tx.typeData;
          const terminatedPosition = find(positions, { id: terminatePositionTypeData.id });
          if (terminatedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesTerminate',
                defaultMessage: 'Your {from}:{to} position has been closed',
              }),
              {
                from: (terminatedPosition as Position).from.symbol,
                to: (terminatedPosition as Position).to.symbol,
              }
            );
          }
          break;
        }
        case TransactionTypes.withdrawFunds: {
          const withdrawFundsPositionTypeData = tx.typeData;
          const withdrawnPosition = tx.position || find(positions, { id: withdrawFundsPositionTypeData.id });
          if (withdrawnPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesWithdrawFunds',
                defaultMessage: 'You have withdrawn {amount} {from} funds from your {from}:{to} position',
              }),
              {
                from: (withdrawnPosition as Position).from.symbol,
                to: (withdrawnPosition as Position).to.symbol,
                amount: formatCurrencyAmount(
                  BigNumber.from(withdrawFundsPositionTypeData.removedFunds),
                  (withdrawnPosition as Position).from
                ),
              }
            );
          }
          break;
        }
        case TransactionTypes.withdrawPosition: {
          const withdrawPositionTypeData = tx.typeData;
          const withdrawnPosition = find(positions, { id: withdrawPositionTypeData.id });
          if (withdrawnPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesWithdraw',
                defaultMessage: 'You have withdrawn from your {from}:{to} position',
              }),
              {
                from: (withdrawnPosition as Position).from.symbol,
                to: (withdrawnPosition as Position).to.symbol,
              }
            );
          }
          break;
        }
        case TransactionTypes.addFundsPosition: {
          const addFundsTypeData = tx.typeData;
          const fundedPosition = find(positions, { id: addFundsTypeData.id });
          if (fundedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesAddFunds',
                defaultMessage: '{amount} {from} have been added to your {from}:{to} position',
              }),
              {
                from: (fundedPosition as Position).from.symbol,
                to: (fundedPosition as Position).to.symbol,
                amount: addFundsTypeData.newFunds,
              }
            );
          }
          break;
        }
        case TransactionTypes.resetPosition: {
          const resetPositionTypeData = tx.typeData;
          const resettedPosition = find(positions, { id: resetPositionTypeData.id });
          const swapInterval = BigNumber.from((resettedPosition as Position).swapInterval);

          if (resettedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesReset',
                defaultMessage:
                  '{amount} {from} have been added to your {from}:{to} position and it has been set to run for {swaps} {frequency}',
              }),
              {
                from: (resettedPosition as Position).from.symbol,
                to: (resettedPosition as Position).to.symbol,
                amount: resetPositionTypeData.newFunds,
                swaps: resetPositionTypeData.newSwaps,
                frequency: getFrequencyLabel(intl, swapInterval.toString(), resetPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TransactionTypes.removeFunds: {
          const removeFundsTypeData = tx.typeData;
          const removeFundedPosition = find(positions, { id: removeFundsTypeData.id });
          if (removeFundedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesRemoveFunds',
                defaultMessage: '{amount} {from} have been removed from your {from}:{to} position',
              }),
              {
                from: (removeFundedPosition as Position).from.symbol,
                to: (removeFundedPosition as Position).to.symbol,
                amount: removeFundsTypeData.ammountToRemove,
              }
            );
          }
          break;
        }

        case TransactionTypes.modifySwapsPosition: {
          const modifySwapsPositionTypeData = tx.typeData;
          const modifiedPosition = find(positions, { id: modifySwapsPositionTypeData.id });
          const swapInterval = BigNumber.from((modifiedPosition as Position).swapInterval);

          if (modifiedPosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesModifySwaps',
                defaultMessage: 'Your {from}:{to} position has now been set to run for {swaps} {frequency}',
              }),
              {
                from: (modifiedPosition as Position).from.symbol,
                to: (modifiedPosition as Position).to.symbol,
                swaps: modifySwapsPositionTypeData.newSwaps,
                frequency: getFrequencyLabel(intl, swapInterval.toString(), modifySwapsPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TransactionTypes.modifyRateAndSwapsPosition: {
          const modifyRateAndSwapsPositionTypeData = tx.typeData;
          const modifiedRatePosition = find(positions, { id: modifyRateAndSwapsPositionTypeData.id });
          const swapInterval = BigNumber.from((modifiedRatePosition as Position).swapInterval);

          if (modifiedRatePosition) {
            message = intl.formatMessage(
              defineMessage({
                description: 'transactionMessagesModifyRateAndSwaps',
                defaultMessage: 'Your {from}:{to} position has now been set to swap {rate} {freq} for {swaps}',
              }),
              {
                from: (modifiedRatePosition as Position).from.symbol,
                to: (modifiedRatePosition as Position).to.symbol,
                rate: modifyRateAndSwapsPositionTypeData.newRate,
                freq: intl.formatMessage(
                  STRING_SWAP_INTERVALS[swapInterval.toString() as keyof typeof STRING_SWAP_INTERVALS].every
                ),
                swaps: getFrequencyLabel(intl, swapInterval.toString(), modifyRateAndSwapsPositionTypeData.newSwaps),
              }
            );
          }
          break;
        }
        case TransactionTypes.transferPosition: {
          const transferedTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesTransfer',
              defaultMessage: 'Your {from}:{to} has now been transfered to {address}',
            }),
            {
              from: transferedTypeData.from,
              to: transferedTypeData.to,
              address: transferedTypeData.toAddress,
            }
          );
          break;
        }
        case TransactionTypes.modifyPermissions: {
          const transferedTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesModifyPermissions',
              defaultMessage: 'Your {from}:{to} position permissions have now been set',
            }),
            {
              from: transferedTypeData.from,
              to: transferedTypeData.to,
            }
          );
          break;
        }
        case TransactionTypes.approveCompanion: {
          const approveCompanionTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveCompanion',
              defaultMessage: 'Our Hub Companion has been approved to modify your {from}:{to} position',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TransactionTypes.migratePosition: {
          const approveCompanionTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesMigrate',
              defaultMessage: 'Your {from}:{to} position has been migrated',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TransactionTypes.migratePositionYield: {
          const approveCompanionTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesMigrate',
              defaultMessage: 'Your {from}:{to} position has now started generating yield',
            }),
            {
              from: approveCompanionTypeData.from,
              to: approveCompanionTypeData.to,
            }
          );
          break;
        }
        case TransactionTypes.newPair: {
          const newPairTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesNewPair',
              defaultMessage: 'The pair {from}:{to} has been created',
            }),
            {
              from: newPairTypeData.token0.symbol,
              to: newPairTypeData.token1.symbol,
            }
          );
          break;
        }
        case TransactionTypes.approveToken: {
          const tokenApprovalTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveToken',
              defaultMessage: '{from} is now ready to be used',
            }),
            {
              from: tokenApprovalTypeData.token.symbol,
            }
          );
          break;
        }
        case TransactionTypes.approveTokenExact: {
          const tokenApprovalExactTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesApproveTokenExact',
              defaultMessage: 'You are now ready to use {amount} {from}',
            }),
            {
              from: tokenApprovalExactTypeData.token.symbol,
              amount: formatCurrencyAmount(
                BigNumber.from(tokenApprovalExactTypeData.amount),
                tokenApprovalExactTypeData.token,
                4
              ),
            }
          );
          break;
        }
        case TransactionTypes.eulerClaimClaimFromMigrator: {
          const eulerClaimClaimFromMigratorTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimClaimFromMigrator',
              defaultMessage: 'You claimed your due for {token} from the Euler Claim page',
            }),
            {
              token: eulerClaimClaimFromMigratorTypeData.token.symbol,
            }
          );
          break;
        }
        case TransactionTypes.eulerClaimPermitMany: {
          const eulerClaimPermitManyTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimPermitMany',
              defaultMessage: 'Mean Finance can now close {positions} positions',
            }),
            {
              positions: eulerClaimPermitManyTypeData.positionIds.length,
            }
          );
          break;
        }
        case TransactionTypes.eulerClaimTerminateMany: {
          const eulerClaimTerminateManyTypeData = tx.typeData;
          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesEulerClaimTerminateMany',
              defaultMessage: '{positions} positions were closed',
            }),
            {
              positions: eulerClaimTerminateManyTypeData.positionIds.length,
            }
          );
          break;
        }
        case TransactionTypes.claimCampaign: {
          const claimCampaignTypeData = tx.typeData;

          message = intl.formatMessage(
            defineMessage({
              description: 'transactionMessagesClaimCampaign',
              defaultMessage: 'The {campaign} campaign has been claimed',
            }),
            {
              campaign: claimCampaignTypeData.name,
            }
          );
          break;
        }
        default:
          break;
      }

      return message;
    },
    [availablePairs, currentPositions, pastPositions]
  );
}

export default useBuildTransactionMessages;
