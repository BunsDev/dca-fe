import { createMockInstance } from '@common/utils/tests';
import { BigNumber } from 'ethers';
import { BLOWFISH_ENABLED_CHAINS } from '@constants';
import { BlowfishResponse, StateChangeKind } from '@types';
import { AxiosResponse } from 'axios';
import SimulationService from './simulationService';
import MeanApiService from './meanApiService';
import ProviderService from './providerService';

jest.mock('./providerService');
jest.mock('./meanApiService');

/**
 * Create mock instance of given class or function constructor
 *
 * @param cl Class constructor
 * @returns New mocked instance of given constructor with all methods mocked
 */

jest.useFakeTimers();

const MockedMeanApiService = jest.mocked(MeanApiService, { shallow: true });
const MockedProviderService = jest.mocked(ProviderService, { shallow: true });
describe('Simulation Service', () => {
  let simulationService: SimulationService;
  let meanApiService: jest.MockedObject<MeanApiService>;
  let providerService: jest.MockedObject<ProviderService>;

  beforeEach(() => {
    meanApiService = createMockInstance(MockedMeanApiService);
    providerService = createMockInstance(MockedProviderService);

    simulationService = new SimulationService(
      meanApiService as unknown as MeanApiService,
      providerService as unknown as ProviderService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('simulateGasPriceTransaction', () => {
    test('it should return the none action when the estimate gas passess', async () => {
      providerService.estimateGas.mockResolvedValue(BigNumber.from(10));
      const result = await simulationService.simulateGasPriceTransaction({ from: 'me', to: 'you', data: 'data' });

      expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
      expect(result).toEqual({
        action: 'NONE',
        warnings: [],
        simulationResults: {
          expectedStateChanges: [],
        },
      });
    });

    test('it should throw an error when estimateGas fails', async () => {
      providerService.estimateGas.mockImplementation(() => {
        throw new Error('blabalbla');
      });

      try {
        await simulationService.simulateGasPriceTransaction({ from: 'me', to: 'you', data: 'data' });
        expect(1).toEqual(2);
      } catch (e) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
        // eslint-disable-next-line jest/no-conditional-expect
        expect(e).toEqual(Error('blabalbla'));
      }
    });
  });
  describe('simulateTransaction', () => {
    test('it should call simulateGasPriceTransaction if its not a blowfish enabled chain', async () => {
      providerService.estimateGas.mockResolvedValue(BigNumber.from(10));
      const result = await simulationService.simulateTransaction({ from: 'me', to: 'you', data: 'data' }, 99999, false);

      expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
      expect(result).toEqual({
        action: 'NONE',
        warnings: [],
        simulationResults: {
          expectedStateChanges: [],
        },
      });
    });

    BLOWFISH_ENABLED_CHAINS.forEach((chainId) => {
      test(`it should call simulateGasPriceTransaction if forceProviderSimulation is true for chain ${chainId}`, async () => {
        providerService.estimateGas.mockResolvedValue(BigNumber.from(10));
        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data' },
          chainId,
          true
        );

        expect(providerService.estimateGas).toHaveBeenCalledWith({ from: 'me', to: 'you', data: 'data' });
        expect(result).toEqual({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });
      });

      test(`it should call simulateGasPriceTransaction if the simulation returns errors for chain ${chainId}`, async () => {
        meanApiService.simulateTransaction.mockResolvedValue({
          data: {
            action: 'NONE',
            warnings: [],
            simulationResults: {
              error: { humanReadableError: 'There was some error' },
              expectedStateChanges: [
                {
                  humanReadableDiff: 'Something changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
                {
                  humanReadableDiff: 'Something else changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
              ],
            },
          } as BlowfishResponse,
        } as unknown as AxiosResponse<BlowfishResponse>);

        providerService.estimateGas.mockResolvedValue(BigNumber.from(10));
        simulationService.simulateGasPriceTransaction = jest.fn().mockResolvedValue({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });

        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data', value: '100' },
          chainId,
          false
        );

        expect(meanApiService.simulateTransaction).toHaveBeenCalledWith(
          {
            from: 'me',
            to: 'you',
            value: '100',
            data: 'data',
          },
          'me',
          {
            origin: window.location.origin,
          },
          chainId
        );

        expect(simulationService.simulateGasPriceTransaction).toHaveBeenCalledWith({
          from: 'me',
          to: 'you',
          data: 'data',
          value: '100',
        });
        expect(result).toEqual({
          action: 'NONE',
          warnings: [],
          simulationResults: {
            expectedStateChanges: [],
          },
        });
      });

      test(`it should call the meanApiService simulate transaction and return the mapped value for chain ${chainId}`, async () => {
        meanApiService.simulateTransaction.mockResolvedValue({
          data: {
            action: 'NONE',
            warnings: [],
            simulationResults: {
              expectedStateChanges: [
                {
                  humanReadableDiff: 'Something changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
                {
                  humanReadableDiff: 'Something else changed',
                  rawInfo: {
                    kind: StateChangeKind.ERC20_TRANSFER,
                    data: {
                      amount: {
                        before: '1',
                        after: '2',
                      },
                    },
                  },
                },
              ],
            },
          },
        } as unknown as AxiosResponse<BlowfishResponse>);

        const result = await simulationService.simulateTransaction(
          { from: 'me', to: 'you', data: 'data', value: '100' },
          chainId,
          false
        );

        expect(meanApiService.simulateTransaction).toHaveBeenCalledWith(
          {
            from: 'me',
            to: 'you',
            value: '100',
            data: 'data',
          },
          'me',
          {
            origin: window.location.origin,
          },
          chainId
        );

        expect(result).toEqual({
          action: 'NONE',
          simulationResults: {
            expectedStateChanges: [
              {
                humanReadableDiff: 'Something else changed',
                rawInfo: {
                  kind: StateChangeKind.ERC20_TRANSFER,
                  data: {
                    amount: {
                      before: '1',
                      after: '2',
                    },
                  },
                },
              },
              {
                humanReadableDiff: 'Something changed',
                rawInfo: {
                  kind: StateChangeKind.ERC20_TRANSFER,
                  data: {
                    amount: {
                      before: '1',
                      after: '2',
                    },
                  },
                },
              },
            ],
          },
          warnings: [],
        });
      });
    });
  });
});
