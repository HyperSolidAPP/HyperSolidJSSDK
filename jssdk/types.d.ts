/**
 * HyperSolid SDK TypeScript Type Definitions
 *
 * Provides complete type support for JavaScript SDK
 */

declare global {
  interface Window {
    HyperSolidSDK: HyperSolidSDK;
    flutter_inappwebview?: {
      callHandler: (handlerName: string, ...args: any[]) => Promise<any>;
    };
  }
}

/**
 * Wallet Information Interface
 */
export interface WalletInfo {
  /** Wallet address */
  address: string;
  /** Connection status */
  isConnected: boolean;
  /** USDC perp balance information */
  perpBalance?: Record<string, string>;
}

/**
 * Navigation Options Interface
 */
export interface NavigationOptions {
  /** Whether to clear route stack */
  clearStack?: boolean;
  /** Passed arguments */
  arguments?: Record<string, any>;
  /** URL parameters */
  parameters?: Record<string, string>;
}

/**
 * Trade Detail Navigation Parameters Interface
 */
export interface TradeDetailParams {
  /** Trading pair symbol (required) */
  symbol: string;
  /** Trading type (required): 'spot' or 'perp' */
  type: "spot" | "perp";
  /** Coin name */
  coinName?: string;
  /** Coin name suffix */
  coinNameSuffix?: string;
  /** Additional navigation options */
  options?: NavigationOptions;
}

/**
 * Trade Order Navigation Parameters Interface
 */
export interface TradeOrderParams extends TradeDetailParams {
  /** Order action: 'buy' or 'sell' */
  action?: "buy" | "sell";
}

/**
 * Position Information Interface
 */
export interface PositionInfo {
  /** Coin symbol */
  coin: string;
  /** Position details */
  position: {
    /** Position size (positive for long, negative for short) */
    szi: string;
    /** Entry price */
    entryPx?: string;
    /** Unrealized PnL */
    unrealizedPnl?: string;
    /** Used margin */
    marginUsed?: string;
  };
}

/**
 * Position Summary Interface
 */
export interface PositionSummary {
  /** Total number of positions */
  totalPositions: number;
  /** Number of long positions */
  longPositions: number;
  /** Number of short positions */
  shortPositions: number;
  /** Total unrealized PnL */
  totalUnrealizedPnl: number;
  /** Total used margin */
  totalMarginUsed: number;
}

/**
 * Order Information Interface
 */
export interface OrderInfo {
  /** Order ID */
  oid: string;
  /** Coin symbol */
  coin: string;
  /** Order side: 'B' for buy, 'A' for sell */
  side: "B" | "A";
  /** Order size */
  sz: string;
  /** Limit price */
  limitPx?: string;
  /** Order type */
  orderType?: string;
  /** Reduce only flag */
  reduceOnly?: boolean;
  /** Timestamp */
  timestamp?: number;
}

/**
 * Order Summary Interface
 */
export interface OrderSummary {
  /** Total number of orders */
  totalOrders: number;
  /** Number of buy orders */
  buyOrders: number;
  /** Number of sell orders */
  sellOrders: number;
  /** Total order value */
  totalValue: number;
  /** List of coins with orders */
  coins: string[];
}

/**
 * Fill Information Interface
 */
export interface FillInfo {
  /** Fill ID */
  fid: string;
  /** Order ID */
  oid: string;
  /** Coin symbol */
  coin: string;
  /** Fill side: 'B' for buy, 'A' for sell */
  side: "B" | "A";
  /** Fill size */
  sz: string;
  /** Fill price */
  px: string;
  /** Fee paid */
  fee?: string;
  /** Timestamp */
  time?: number;
  /** Whether it's a liquidation */
  liquidation?: boolean;
}

/**
 * Fill Summary Interface
 */
export interface FillSummary {
  /** Total number of fills */
  totalFills: number;
  /** Total trading volume */
  totalVolume: number;
  /** Total fees paid */
  totalFees: number;
  /** Number of buy fills */
  buyFills: number;
  /** Number of sell fills */
  sellFills: number;
  /** List of traded coins */
  coins: string[];
}

/**
 * Price Information Interface
 */
export interface PriceInfo {
  /** Trading pair symbol */
  symbol: string;
  /** Trading type */
  type: "spot" | "perp";
  /** Current price */
  price: string;
  /** Bid price */
  bid?: string;
  /** Ask price */
  ask?: string;
  /** 24h trading volume */
  volume24h?: string;
  /** 24h price change */
  change24h?: string;
  /** Timestamp */
  timestamp?: number;
}

/**
 * Asset Data Interface
 */
export interface AssetData {
  /** Coin symbol */
  symbol: string;
  /** Available balance */
  balance: string;
  /** Locked balance */
  locked?: string;
  /** Total balance */
  total?: string;
  /** USD value */
  usdValue?: string;
  /** Current position */
  position?: string;
  /** Used margin */
  marginUsed?: string;
  /** Available margin */
  marginAvailable?: string;
}

/**
 * Trade Size Limits Interface
 */
export interface TradeSizeLimits {
  /** Maximum buy size */
  maxBuySize: string;
  /** Maximum sell size */
  maxSellSize: string;
  /** Minimum order size */
  minOrderSize: string;
  /** Maximum leverage */
  maxLeverage?: string;
  /** Risk level */
  riskLevel?: string;
}

/**
 * System Information Interface
 */
export interface SystemInfo {
  /** App version */
  appVersion: string;
  /** Platform (iOS/Android) */
  platform: string;
  /** Device model */
  deviceModel?: string;
  /** OS version */
  osVersion?: string;
  /** SDK version */
  sdkVersion: string;
  /** Build number */
  buildNumber?: string;
}

/**
 * Trading Order Parameters Interface
 */
export interface TradingOrderParams {
  /** Trading pair symbol */
  symbol: string;
  /** Order size */
  size?: number;
  /** Order price (for limit orders) */
  price?: number;
  /** Percentage of available funds/position (for percentage orders) */
  percentage?: number;
  /** Whether it's spot trading */
  isSpot?: boolean;
  /** Reduce only mode */
  reduceOnly?: boolean;
}

/**
 * API Response Interface
 */
export interface ApiResponse<T = any> {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: T;
  /** Error message */
  error?: string;
  /** Error code */
  code?: string;
  /** Response timestamp */
  timestamp?: number;
}

/**
 * Wallet API Interface
 */
export interface WalletAPI {
  /** Get complete wallet information */
  getInfo(): Promise<ApiResponse<WalletInfo>>;
  /** Get wallet address */
  getAddress(): Promise<ApiResponse<{ address: string }>>;
  /** Get wallet perpetual balance */
  getWalletPerpBalance(): Promise<ApiResponse<Record<string, string>>>;
  /** Check wallet connection status */
  isConnected(): Promise<ApiResponse<boolean>>;
}

/**
 * Position API Interface
 */
export interface PositionAPI {
  /** Get all positions */
  getPositions(): Promise<ApiResponse<{ positions: PositionInfo[] }>>;
  /** Get position for specified coin */
  getPosition(coin: string): Promise<ApiResponse<PositionInfo | null>>;
  /** Get position summary */
  getPositionSummary(): Promise<ApiResponse<PositionSummary>>;
  /** Check if has position for specified coin */
  hasPosition(coin: string): Promise<ApiResponse<boolean>>;
  /** Get long positions */
  getLongPositions(): Promise<PositionInfo[]>;
  /** Get short positions */
  getShortPositions(): Promise<PositionInfo[]>;
}

/**
 * Fill API Interface
 */
export interface FillAPI {
  /** Get all fill history */
  getUserFills(): Promise<ApiResponse<{ fills: FillInfo[] }>>;
  /** Get fill history for specified coin */
  getUserFillsByCoin(coin: string): Promise<ApiResponse<{ fills: FillInfo[] }>>;
  /** Get fill history summary */
  getFillsSummary(): Promise<ApiResponse<FillSummary>>;
}

/**
 * Order API Interface
 */
export interface OrderAPI {
  /** Get all open orders */
  getOpenOrders(): Promise<ApiResponse<{ orders: OrderInfo[] }>>;
  /** Get open orders for specified coin */
  getOpenOrdersByCoin(
    coin: string
  ): Promise<ApiResponse<{ orders: OrderInfo[] }>>;
  /** Get order summary statistics */
  getOrdersSummary(): Promise<ApiResponse<OrderSummary>>;
  /** Get buy orders */
  getBuyOrders(): Promise<OrderInfo[]>;
  /** Get sell orders */
  getSellOrders(): Promise<OrderInfo[]>;
}

/**
 * Price API Interface
 */
export interface PriceAPI {
  /** Get current price */
  getCurrentPrice(
    symbol: string,
    type?: "spot" | "perp"
  ): Promise<ApiResponse<PriceInfo>>;
  /** Get trade details */
  getTradeDetail(
    symbol: string,
    type?: "spot" | "perp"
  ): Promise<ApiResponse<any>>;
}

/**
 * Asset API Interface
 */
export interface AssetAPI {
  /** Get user active asset data */
  getUserActiveAssetData(symbol: string): Promise<ApiResponse<AssetData>>;
  /** Get user maximum trade sizes */
  getUserMaxTradeSizes(symbol: string): Promise<ApiResponse<TradeSizeLimits>>;
}

/**
 * Trading API Interface
 */
export interface TradingAPI {
  /** Limit buy order */
  limitBuy(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Limit sell order */
  limitSell(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Market buy order */
  marketBuy(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Market sell order */
  marketSell(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Limit buy by percentage */
  limitBuyByPercentage(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Limit sell by percentage */
  limitSellByPercentage(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Market buy by percentage */
  marketBuyByPercentage(params: TradingOrderParams): Promise<ApiResponse<any>>;
  /** Market sell by percentage */
  marketSellByPercentage(params: TradingOrderParams): Promise<ApiResponse<any>>;
}

/**
 * Navigation API Interface
 */
export interface NavigationAPI {
  /** Navigate to home page */
  toHome(): Promise<ApiResponse<boolean>>;
  /** Navigate to portfolio page */
  toPortfolio(): Promise<ApiResponse<boolean>>;
  /** Navigate to trade page */
  toTrade(): Promise<ApiResponse<boolean>>;
  /** Navigate to account page */
  toAccount(): Promise<ApiResponse<boolean>>;
  /** Navigate to trade detail page */
  toTradeDetail(params: TradeDetailParams): Promise<ApiResponse<boolean>>;
  /** Navigate to trade order page */
  toTradeOrder(params: TradeOrderParams): Promise<ApiResponse<boolean>>;
  /** Navigate to custom route */
  navigateTo(route: string): Promise<ApiResponse<boolean>>;
  /** Go back to previous page */
  goBack(): Promise<ApiResponse<boolean>>;
  /** Check if can go back */
  canGoBack(): Promise<ApiResponse<boolean>>;
  /** Get current route */
  getCurrentRoute(): Promise<ApiResponse<string>>;
}

/**
 * System API Interface
 */
export interface SystemAPI {
  /** Refresh page */
  refresh(): void;
  /** Get SDK version */
  getVersion(): string;
  /** Ping Flutter app */
  ping(): Promise<ApiResponse<string>>;
  /** Get system information */
  getSystemInfo(): Promise<ApiResponse<SystemInfo>>;
}

/**
 * Utility Functions Interface
 */
export interface UtilsAPI {
  /** Check if SDK is ready */
  isReady(): boolean;
  /** Register ready callback */
  onReady(callback: () => void): void;
  /** Generate unique ID */
  generateId(): string;
}

/**
 * Main HyperSolid SDK Interface
 */
export interface HyperSolidSDK {
  /** SDK version */
  version: string;
  /** Wallet related APIs */
  wallet: WalletAPI;
  /** Position related APIs */
  position: PositionAPI;
  /** Fill history related APIs */
  fills: FillAPI;
  /** Order related APIs */
  orders: OrderAPI;
  /** Price related APIs */
  price: PriceAPI;
  /** Asset related APIs */
  asset: AssetAPI;
  /** Trading related APIs */
  trading: TradingAPI;
  /** Navigation related APIs */
  navigation: NavigationAPI;
  /** System related APIs */
  system: SystemAPI;
  /** Utility functions */
  utils: UtilsAPI;
}

export default HyperSolidSDK;
