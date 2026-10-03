import {
  Exchange,
  MarketSegment,
  OptionType,
  LegSide,
  GapMode,
  ReferenceStrikeMode,
  DirectionMode,
  FeedStatus
} from './options';

export interface UnderlyingStock {
  symbol: string;
  name: string;
  sector: string;
  lotSize: number;
  spotPrice: number;
  strikeStep: number;
  expiries: string[];
  exchange?: Exchange;
  exchangeSegment?: MarketSegment;
  cashToken?: string | null;
  hasOptions?: boolean;
}

export interface BseCashStock {
  symbol: string;
  name: string;
  token: string;
  lotSize: number;
  exchange: 'BSE';
  exchangeSegment: 'BSE_CM';
  hasOptions?: boolean;
}

export interface OptionContract {
  exchange: 'NFO' | 'BFO';
  marketExchange?: Exchange;
  exchangeSegment?: 'NFO' | 'BFO';
  cashSegment?: 'NSE' | 'BSE_CM';
  underlying: string;
  tradingSymbol: string;
  token: string;
  expiry: string;
  strike: number;
  optionType: OptionType;
  lotSize: number;
  tickSize: number;

  ltp: number | null;
  bid: number | null;
  bidQty: number | null;
  ask: number | null;
  askQty: number | null;
  volume: number | null;
  oi: number | null;
  oiChange?: number | null;
  prevClose: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  avgPrice?: number | null;

  iv: number | null;
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;

  timestamp: number;
  lastTickDirection?: 'up' | 'down';
}

export interface StrategyLeg {
  side: LegSide;
  optionType: OptionType;
  strike: number;
  quantity: number;
  actualQuantity: number;
  contract: OptionContract;
  executionPrice: number | null;
}

export interface RatioStrategyRow {
  id: string;
  underlying: string;
  expiry: string;
  optionType: OptionType;
  direction: DirectionMode;
  ratioStr: string;
  longQty: number;
  shortQty: number;
  buyStrike: number;
  sellStrike: number;
  actualGap: number;
  gapSteps: number;
  targetGapRupees?: number;
  lotSize: number;

  buyAsk: number | null;
  buyBid: number | null;
  buyAskQty: number | null;
  buyBidQty: number | null;
  buyLtp: number | null;

  sellBid: number | null;
  sellAsk: number | null;
  sellBidQty: number | null;
  sellAskQty: number | null;
  sellLtp: number | null;

  executableNetEntry: number | null;
  executableTotalEntry: number | null;
  midNetEntry: number | null;
  conservativeLiquidation: number | null;
  slippageCost: number | null;
  combinedSpreadCost: number | null;

  buySpread: number | null;
  buySpreadPct: number | null;
  sellSpread: number | null;
  sellSpreadPct: number | null;

  maxProfitPerShare: number | null;
  maxProfitPerLot: number | null;
  maxProfitAtSpot: number | null;
  maxLossPerShare: number | 'Unlimited';
  maxLossPerLot: number | 'Unlimited';
  isUnlimitedLoss: boolean;
  breakevens: number[];
  breakevenDistPcts: number[];
  currentMtmPerShare: number | null;
  currentMtmPerLot: number | null;

  buyIv: number | null;
  sellIv: number | null;
  netDelta: number | null;
  netGamma: number | null;
  netTheta: number | null;
  netVega: number | null;
  lotDelta: number | null;
  lotTheta: number | null;

  buyOi: number | null;
  sellOi: number | null;
  buyOiChange: number | null;
  sellOiChange: number | null;
  buyVolume: number | null;
  sellVolume: number | null;
  combinedOi: number | null;
  combinedVolume: number | null;

  legs: StrategyLeg[];
}

export interface PayoffPoint {
  spotPrice: number;
  pnlPerShare: number;
  pnlPerLot: number;
}

export interface StrategyPayoffResult {
  points: PayoffPoint[];
  maxProfitPerShare: number;
  maxProfitPerLot: number;
  maxProfitAtSpot: number;
  maxLossPerShare: number | 'Unlimited';
  maxLossPerLot: number | 'Unlimited';
  isUnlimitedLoss: boolean;
  breakevens: number[];
  breakevenDistPcts: number[];
  currentSpot: number;
}

export interface AngelOneCredentials {
  apiKey: string;
  clientCode: string;
  pin: string;
  totpSecret: string;
  feedToken?: string;
  jwtToken?: string;
}

export interface MarketFeedMetrics {
  status: FeedStatus;
  angelConnected: boolean;
  isSimulated: boolean;
  lastTickTime: number;
  latencyMs: number;
  dataAgeMs: number;
  subscribedTokensCount: number;
  ticksPerSecond: number;
}

export interface ScannerFilterConfig {
  netType: 'ALL' | 'CREDIT_ONLY' | 'DEBIT_ONLY';
  minOi: number;
  minVolume: number;
  maxSpreadPct: number;
  minMaxProfit: number;
  minDelta: number;
  maxDelta: number;
  searchQuery: string;
}

export type SortField =
  | 'netEntry'
  | 'maxProfit'
  | 'spreadCost'
  | 'combinedOi'
  | 'combinedVolume'
  | 'netTheta'
  | 'netDelta'
  | 'buyStrike';

export type SortDirection = 'ASC' | 'DESC';

export interface GapValidationResult {
  gapIndex: number;
  requestedGap: number;
  actualGap: number;
  isValid: boolean;
  status: 'VALID' | 'ADJUSTED' | 'OUT_OF_BOUNDS';
}

export interface RatioMatrixCell {
  targetGap: number;
  actualGap: number;
  gapSteps: number;
  isValid: boolean;
  isAdjusted: boolean;
  buyStrike: number;
  sellStrike: number;
  buyAsk: number | null;
  buyBid: number | null;
  sellBid: number | null;
  sellAsk: number | null;
  netEntryBuy: number | null;
  netEntrySell: number | null;
  strategyRow?: RatioStrategyRow;
}

export interface RatioMatrixRow {
  strike: number;
  ltp: number | null;
  isAtm: boolean;
  cells: RatioMatrixCell[];
}

export interface StockMarketSummary {
  cash: number;
  future: number;
  basis: number;
  atm: number;
  atmStraddle: number;
  atmStraddlePct: number;
  dte: number;
}

export interface SavedPreset {
  id: string;
  name: string;
  symbol: string;
  gap: number;
  cnt: number;
  stk: string | number;
  ratioLong: number;
  ratioShort: number;
  minStrike: number | 'ALL';
  maxStrike: number | 'ALL';
  createdAt: number;
}
