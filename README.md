# HyperSolid WebView JSSDK Technical Documentation

## Project Overview

HyperSolid is a cryptocurrency trading application developed with Flutter, providing spot and perpetual contract trading capabilities. This WebView JSSDK project enables third-party Web applications to interact with the HyperSolid App, achieving seamless Web-to-Native communication.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HyperSolid App (Flutter)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   UI Layer      │  │  Business Logic │  │   Data Layer    │ │
│  │                 │  │                 │  │                 │ │
│  │ • Home Page     │  │ • Trade Service │  │ • API Service   │ │
│  │ • Trade Page    │  │ • Wallet Service│  │ • Local Storage │ │
│  │ • Portfolio     │  │ • Order Service │  │ • WebSocket     │ │
│  │ • Account       │  │ • Price Service │  │ • Database      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    WebView Bridge Layer                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                  Bridge Manager                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │ │
│  │  │   Wallet    │ │ Navigation  │ │   Order     │ │ System │ │ │
│  │  │   Handler   │ │   Handler   │ │   Handler   │ │Handler │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │ │
│  │  │  Position   │ │    Price    │ │   Asset     │ │  Fill  │ │ │
│  │  │   Handler   │ │   Handler   │ │   Handler   │ │Handler │ │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       WebView Container                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Web Application                          │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │              HyperSolid JSSDK                           │ │ │
│  │  │                                                         │ │ │
│  │  │  • wallet API    • position API   • order API          │ │ │
│  │  │  • trading API   • price API      • navigation API     │ │ │
│  │  │  • asset API     • fill API       • system API         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                                                             │ │
│  │  HTML + CSS + JavaScript                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Core Functional Modules

### 1. Wallet Management API (Wallet API)

Provides wallet connection status query, address retrieval, and balance inquiry functions.

**Main Features:**

- Get wallet connection information
- Query wallet address
- Get account balance
- Check connection status

**Usage Examples:**

```javascript
// Get wallet information
const { data: walletInfo } = await HyperSolidSDK.wallet.getInfo();
console.log("Wallet address:", walletInfo.address);

// Get balance
const { data: balance } = await HyperSolidSDK.wallet.getWalletPerpBalance();
console.log("Account balance:", balance);
```

### 2. Trading Order API (Trading API) ⭐

**This is the core functionality of the SDK**, providing complete trading order capabilities, supporting both spot and perpetual contract trading.

**Main Features:**

- **Limit Order Trading**: Specify price for buy/sell orders
- **Market Order Trading**: Execute immediately at current market price
- **Percentage-based Orders**: Automatically calculate order size based on available funds percentage
- **Position Management**: Support reduce-only mode
- **Dual Market Support**: Spot trading and perpetual contract trading

**API Detailed Description:**

#### Limit Order API

```javascript
// Limit Buy (Long)
await HyperSolidSDK.trading.limitBuy({
  symbol: "BTC", // Trading pair symbol
  price: 50000, // Limit price
  size: 0.001, // Trading quantity
  isSpot: false, // false=perpetual contract, true=spot
  reduceOnly: false, // Reduce-only mode
});

// Limit Sell (Short)
await HyperSolidSDK.trading.limitSell({
  symbol: "BTC",
  price: 52000,
  size: 0.001,
  isSpot: false,
  reduceOnly: false,
});
```

#### Market Order API

```javascript
// Market Buy (automatically get current price)
await HyperSolidSDK.trading.marketBuy({
  symbol: "BTC",
  size: 0.001,
  isSpot: false,
  reduceOnly: false,
});

// Market Sell
await HyperSolidSDK.trading.marketSell({
  symbol: "BTC",
  size: 0.001,
  isSpot: false,
  reduceOnly: false,
});
```

#### Percentage-based Order API

```javascript
// Use 25% of available funds for limit buy
await HyperSolidSDK.trading.limitBuyByPercentage({
  symbol: "BTC",
  price: 50000,
  percentage: 0.25, // 25% of available funds
  isSpot: false,
  reduceOnly: false,
});

// Use 50% of position for market sell
await HyperSolidSDK.trading.marketSellByPercentage({
  symbol: "BTC",
  percentage: 0.5, // 50% of position
  isSpot: false,
  reduceOnly: true,
});
```

**Technical Advantages of Trading API:**

1. **Smart Price Retrieval**: Market orders automatically get latest price from server
2. **Fund Management**: Percentage orders automatically calculate maximum tradable amount
3. **Risk Control**: Support reduce-only mode to prevent over-leverage
4. **Dual Market Support**: Unified interface for both spot and contract trading
5. **Error Handling**: Comprehensive exception handling and user feedback

### 3. Position Management API (Position API)

Provides real-time position query and management functions.

**Main Features:**

- Get all position list
- Query specific coin position
- Long/short position filtering
- Position summary statistics

**Usage Examples:**

```javascript
// Get all positions
const { data: positions } = await HyperSolidSDK.position.getPositions();

// Get BTC position
const { data: btcPosition } = await HyperSolidSDK.position.getPosition("BTC");

// Get long positions
const longPositions = await HyperSolidSDK.position.getLongPositions();
```

### 4. Order Management API (Order API)

Provides query and management functions for open orders.

**Main Features:**

- Get all open orders
- Query orders by coin
- Classify buy/sell orders
- Order statistics

### 5. Fill History API (Fill API)

Provides query functions for trade execution records.

**Main Features:**

- Get all fill history
- Query fills by coin
- Fill history summary

### 6. Price Query API (Price API)

Provides real-time price data query functions.

**Main Features:**

- Get current price
- Get trade details
- Support spot and contract prices

### 7. Asset Information API (Asset API)

Provides user asset data query functions.

**Main Features:**

- Get user asset data
- Query maximum trade size limits

### 8. Navigation Control API (Navigation API)

Provides page navigation and routing control functions.

**Main Features:**

- Basic page navigation (Home, Trade, Portfolio, Account)
- Trade page navigation (with parameters)
- Custom route navigation
- Back operations

### 9. System Functions API (System API)

Provides system-level function calls.

**Main Features:**

- Page refresh
- Version information query
- System information retrieval
- Connectivity testing

## Technical Features

1. **Asynchronous Communication**: Promise-based asynchronous API design
2. **Type Safety**: Provides TypeScript type definitions
3. **Error Handling**: Unified error handling mechanism
4. **Timeout Control**: 10 second request timeout protection
5. **State Management**: SDK ready state detection
6. **Compatibility**: Supports modern browsers and WebView environments

## Integration Methods

### 1. Include SDK

```html
<script src="./jssdk/hypersolid-sdk.js"></script>
```

### 2. Check SDK Status

```javascript
if (HyperSolidSDK.utils.isReady()) {
  console.log("SDK is ready");
} else {
  HyperSolidSDK.utils.onReady(() => {
    console.log("SDK initialization completed");
  });
}
```

### 3. Call API

```javascript
try {
  const result = await HyperSolidSDK.wallet.getInfo();
  console.log("Call successful:", result);
} catch (error) {
  console.error("Call failed:", error.message);
}
```

## Security

- All API calls are verified through Flutter side
- Support wallet connection status checking
- Provide comprehensive error handling mechanism
- Timeout protection prevents long waiting times

## Version Information

- **Current Version**: 1.0.0
- **Compatibility**: Supports Flutter WebView
- **Update Date**: 2025

---

_This document is the technical specification for HyperSolid WebView JSSDK. For detailed API reference, please check the test examples in `index.html`._
