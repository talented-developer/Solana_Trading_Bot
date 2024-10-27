import { MarketCapRangeNames } from '../enums';

export interface MarketCapRangeInterface {
  id: number;
  name: string;
  lowerBound: number;
  upperBound: number | null;
}

export const MarketCapRanges: MarketCapRangeInterface[] = [
  {
    id: 1,
    name: MarketCapRangeNames.BETWEEN_1K_100K,
    lowerBound: 1_000,
    upperBound: 100_000,
  },
  {
    id: 2,
    name: MarketCapRangeNames.BETWEEN_100K_1M,
    lowerBound: 100_000,
    upperBound: 1_000_000,
  },
  {
    id: 3,
    name: MarketCapRangeNames.BETWEEN_1M_10M,
    lowerBound: 1_000_000,
    upperBound: 10_000_000,
  },
  {
    id: 4,
    name: MarketCapRangeNames.MORE_THAN_10M,
    lowerBound: 10_000_000,
    upperBound: null,
  },
];