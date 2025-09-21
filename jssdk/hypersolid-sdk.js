/**
 * HyperSolid Web SDK
 *
 * Provides communication interface between Web pages and Flutter App
 * Version: 1.0.0
 */

(function (window) {
  "use strict";

  // SDK Version
  const SDK_VERSION = "1.0.0";

  // Message ID Counter
  let messageIdCounter = 0;

  // Pending Request Callbacks
  const pendingCallbacks = new Map();

  // SDK Ready State
  let isSDKReady = false;
  const readyCallbacks = [];

  // Check if SDK is Ready
  function checkSDKReady() {
    return !!(
      window.flutter_inappwebview &&
      window.flutter_inappwebview.callHandler &&
      window.flutterReady
    );
  }

  // Trigger Ready Callbacks
  function triggerReadyCallbacks() {
    if (isSDKReady) return;

    isSDKReady = true;
    console.log("HyperSolid SDK Ready");

    // Execute all ready callbacks
    readyCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("Ready callback execution failed:", error);
      }
    });

    // Clear callback list
    readyCallbacks.length = 0;
  }

  /**
   * Generate Unique Message ID
   */
  function generateMessageId() {
    return `msg_${Date.now()}_${++messageIdCounter}`;
  }

  /**
   * Send Message to Flutter
   */
  async function sendMessageToFlutter(action, data = null, handlerName = null) {
    return new Promise((resolve, reject) => {
      try {
        const messageId = generateMessageId();
        const message = {
          id: messageId,
          action: action,
          data: {
            ...data,
            handlerName: handlerName,
          },
          timestamp: Date.now(),
        };

        // Store callback
        pendingCallbacks.set(messageId, { resolve, reject });

        // Set timeout
        setTimeout(() => {
          if (pendingCallbacks.has(messageId)) {
            pendingCallbacks.delete(messageId);
            reject(new Error(`Request timeout: ${action}`));
          }
        }, 10000); // 10 second timeout

        // Send message to Flutter
        if (
          window.flutter_inappwebview &&
          window.flutter_inappwebview.callHandler
        ) {
          window.flutter_inappwebview
            .callHandler("HyperSolidBridge", message)
            .then((response) => {
              if (pendingCallbacks.has(messageId)) {
                pendingCallbacks.delete(messageId);
                resolve(response);
              }
            })
            .catch((error) => {
              if (pendingCallbacks.has(messageId)) {
                pendingCallbacks.delete(messageId);
                reject(error);
              }
            });
        } else {
          // Flutter WebView bridge is not available
          console.warn("Flutter WebView bridge is not available");
          setTimeout(() => {
            if (pendingCallbacks.has(messageId)) {
              pendingCallbacks.delete(messageId);
              reject(new Error("Flutter WebView bridge is not available"));
            }
          }, 100);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get Coming Soon Response (for unimplemented features)
   */
  function getComingSoonResponse(action) {
    return {
      success: false,
      error: `Feature "${action}" is coming soon`,
      comingSoon: true,
    };
  }

  /**
   * HyperSolid SDK Main Object
   */
  const HyperSolidSDK = {
    // SDK Information
    version: SDK_VERSION,

    /**
     * Wallet Related APIs
     */
    wallet: {
      /**
       * Get Complete Wallet Information
       */
      async getInfo() {
        const result = await sendMessageToFlutter(
          "getWalletInfo",
          {},
          "getWalletInfo"
        );
        return result;
      },

      /**
       * Get Wallet Address
       */
      async getAddress() {
        const result = await sendMessageToFlutter(
          "getWalletAddress",
          {},
          "getWalletInfo"
        );
        return result;
      },

      /**
       * Get Wallet Balance
       */
      async getWalletPerpBalance() {
        const result = await sendMessageToFlutter(
          "getWalletPerpBalance",
          {},
          "getWalletInfo"
        );
        return result;
      },

      /**
       * Check Wallet Connection Status
       */
      async isConnected() {
        const info = await this.getInfo();
        return info;
      },
    },

    /**
     * Position Related APIs
     */
    position: {
      /**
       * Get All Position List
       */
      async getPositions() {
        const result = await sendMessageToFlutter(
          "getPositions",
          {},
          "getPositions"
        );
        return result;
      },

      /**
       * Get Position for Specified Coin
       * @param {string} coin - Coin symbol (e.g. BTC, ETH, SOL)
       */
      async getPosition(coin) {
        if (!coin) {
          throw new Error("coin parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getPosition",
          { coin },
          "getPositions" // Use getPositions as handlerName
        );
        return result;
      },

      /**
       * Get Position Summary Information
       */
      async getPositionSummary() {
        const result = await sendMessageToFlutter(
          "getPositionSummary",
          {},
          "getPositions" // Use getPositions as handlerName
        );
        return result;
      },

      /**
       * Check if Has Position for Specified Coin
       * @param {string} coin - Coin symbol
       */
      async hasPosition(coin) {
        if (!coin) {
          throw new Error("coin parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getPosition",
          { coin },
          "getPositions" // Use getPositions as handlerName
        );
        return result;
      },

      /**
       * Get Long Position List
       */
      async getLongPositions() {
        const { data: result } = await this.getPositions();
        const positions = result.positions;
        return positions.filter((p) => parseFloat(p.position.szi) > 0);
      },

      /**
       * Get Short Position List
       */
      async getShortPositions() {
        const { data: result } = await this.getPositions();
        const positions = result.positions;
        return positions.filter((p) => parseFloat(p.position.szi) < 0);
      },
    },

    /**
     * Fill History Related APIs
     */
    fills: {
      /**
       * Get All Fill History
       */
      async getUserFills() {
        const result = await sendMessageToFlutter(
          "getUserFills",
          {},
          "getUserFills" // Use getUserFills as handlerName
        );
        return result;
      },

      /**
       * Get Fill History for Specified Coin
       * @param {string} coin - Coin symbol (e.g. BTC, ETH, SOL)
       */
      async getUserFillsByCoin(coin) {
        if (!coin) {
          throw new Error("coin parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getUserFillsByCoin",
          { coin },
          "getUserFills" // Use getUserFills as handlerName
        );
        return result;
      },

      /**
       * Get Fill History Summary
       */
      async getFillsSummary() {
        const { data: result } = await this.getUserFills();
        const fills = result.fills;

        // Calculate summary statistics
        const summary = {
          totalFills: fills.length,
          totalVolume: fills.reduce(
            (sum, fill) => sum + parseFloat(fill.sz || 0),
            0
          ),
          totalFees: fills.reduce(
            (sum, fill) => sum + parseFloat(fill.fee || 0),
            0
          ),
          buyFills: fills.filter((fill) => fill.side === "B").length,
          sellFills: fills.filter((fill) => fill.side === "A").length,
          coins: [...new Set(fills.map((fill) => fill.coin))],
        };

        return { data: summary };
      },
    },

    /**
     * Order Related APIs
     */
    orders: {
      /**
       * Get All Open Orders
       */
      async getOpenOrders() {
        const result = await sendMessageToFlutter(
          "getOpenOrders",
          {},
          "getOpenOrders"
        );
        return result;
      },

      /**
       * Get Open Orders for Specified Coin
       * @param {string} coin - Coin symbol (e.g. BTC, ETH, SOL)
       */
      async getOpenOrdersByCoin(coin) {
        if (!coin) {
          throw new Error("coin parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getOpenOrdersByCoin",
          { coin },
          "getOpenOrders"
        );
        return result;
      },

      /**
       * Get Order Summary Statistics
       */
      async getOrdersSummary() {
        const { data: result } = await this.getOpenOrders();
        const orders = result.orders;

        // Calculate summary statistics
        const summary = {
          totalOrders: orders.length,
          buyOrders: orders.filter((order) => order.side === "B").length,
          sellOrders: orders.filter((order) => order.side === "A").length,
          totalValue: orders.reduce((sum, order) => {
            return (
              sum + parseFloat(order.sz || 0) * parseFloat(order.limitPx || 0)
            );
          }, 0),
          coins: [...new Set(orders.map((order) => order.coin))],
        };

        return { data: summary };
      },

      /**
       * Get Buy Orders
       */
      async getBuyOrders() {
        const { data: result } = await this.getOpenOrders();
        const orders = result.orders;
        return orders.filter((order) => order.side === "B");
      },

      /**
       * Get Sell Orders
       */
      async getSellOrders() {
        const { data: result } = await this.getOpenOrders();
        const orders = result.orders;
        return orders.filter((order) => order.side === "A");
      },
    },

    /**
     * Price Related APIs
     */
    price: {
      /**
       * Get Current Price
       * @param {string} symbol - Trading pair symbol
       * @param {string} type - Trading type ('spot' or 'perp')
       */
      async getCurrentPrice(symbol, type = "perp") {
        if (!symbol) {
          throw new Error("symbol parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getCurrentPrice",
          { symbol, type },
          "getCurrentPrice"
        );
        return result;
      },

      /**
       * Get Trade Details
       * @param {string} symbol - Trading pair symbol
       * @param {string} type - Trading type ('spot' or 'perp')
       */
      async getTradeDetail(symbol, type = "perp") {
        if (!symbol) {
          throw new Error("symbol parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getTradeDetail",
          { symbol, type },
          "getTradeDetail"
        );
        return result;
      },
    },

    /**
     * Asset Related APIs
     */
    asset: {
      /**
       * Get User Active Asset Data
       * @param {string} symbol - Coin symbol
       */
      async getUserActiveAssetData(symbol) {
        if (!symbol) {
          throw new Error("symbol parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getUserActiveAssetData",
          { symbol },
          "getUserActiveAssetData"
        );
        return result;
      },

      /**
       * Get User Maximum Trade Sizes
       * @param {string} symbol - Coin symbol
       */
      async getUserMaxTradeSizes(symbol) {
        if (!symbol) {
          throw new Error("symbol parameter is required");
        }
        const result = await sendMessageToFlutter(
          "getUserMaxTradeSizes",
          { symbol },
          "getUserMaxTradeSizes"
        );
        return result;
      },
    },

    /**
     * Trading Related APIs
     */
    trading: {
      /**
       * Limit Buy Order
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.price - Limit price
       * @param {number} params.size - Order size
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async limitBuy(params) {
        const {
          symbol,
          price,
          size,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || !price || !size) {
          throw new Error("symbol, price, and size parameters are required");
        }

        const result = await sendMessageToFlutter(
          "limitBuy",
          { symbol, price, size, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Limit Sell Order
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.price - Limit price
       * @param {number} params.size - Order size
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async limitSell(params) {
        const {
          symbol,
          price,
          size,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || !price || !size) {
          throw new Error("symbol, price, and size parameters are required");
        }

        const result = await sendMessageToFlutter(
          "limitSell",
          { symbol, price, size, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Market Buy Order
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.size - Order size
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async marketBuy(params) {
        const { symbol, size, isSpot = false, reduceOnly = false } = params;

        if (!symbol || !size) {
          throw new Error("symbol and size parameters are required");
        }

        const result = await sendMessageToFlutter(
          "marketBuy",
          { symbol, size, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Market Sell Order
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.size - Order size
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async marketSell(params) {
        const { symbol, size, isSpot = false, reduceOnly = false } = params;

        if (!symbol || !size) {
          throw new Error("symbol and size parameters are required");
        }

        const result = await sendMessageToFlutter(
          "marketSell",
          { symbol, size, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Limit Buy by Percentage
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.price - Limit price
       * @param {number} params.percentage - Percentage of available funds (0-1)
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async limitBuyByPercentage(params) {
        const {
          symbol,
          price,
          percentage,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || !price || percentage === undefined) {
          throw new Error(
            "symbol, price, and percentage parameters are required"
          );
        }

        const result = await sendMessageToFlutter(
          "limitBuyByPercentage",
          { symbol, price, percentage, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Limit Sell by Percentage
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.price - Limit price
       * @param {number} params.percentage - Percentage of position (0-1)
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async limitSellByPercentage(params) {
        const {
          symbol,
          price,
          percentage,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || !price || percentage === undefined) {
          throw new Error(
            "symbol, price, and percentage parameters are required"
          );
        }

        const result = await sendMessageToFlutter(
          "limitSellByPercentage",
          { symbol, price, percentage, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Market Buy by Percentage
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.percentage - Percentage of available funds (0-1)
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async marketBuyByPercentage(params) {
        const {
          symbol,
          percentage,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || percentage === undefined) {
          throw new Error("symbol and percentage parameters are required");
        }

        const result = await sendMessageToFlutter(
          "marketBuyByPercentage",
          { symbol, percentage, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },

      /**
       * Market Sell by Percentage
       * @param {Object} params - Order parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {number} params.percentage - Percentage of position (0-1)
       * @param {boolean} params.isSpot - Is spot trading
       * @param {boolean} params.reduceOnly - Reduce only mode
       */
      async marketSellByPercentage(params) {
        const {
          symbol,
          percentage,
          isSpot = false,
          reduceOnly = false,
        } = params;

        if (!symbol || percentage === undefined) {
          throw new Error("symbol and percentage parameters are required");
        }

        const result = await sendMessageToFlutter(
          "marketSellByPercentage",
          { symbol, percentage, isSpot, reduceOnly },
          "placeOrder"
        );
        return result;
      },
    },

    /**
     * Navigation Related APIs
     */
    navigation: {
      /**
       * Navigate to Home Page
       */
      async toHome() {
        const result = await sendMessageToFlutter("toHome", {}, "navigation");
        return result;
      },

      /**
       * Navigate to Portfolio Page
       */
      async toPortfolio() {
        const result = await sendMessageToFlutter(
          "toPortfolio",
          {},
          "navigation"
        );
        return result;
      },

      /**
       * Navigate to Trade Page
       */
      async toTrade() {
        const result = await sendMessageToFlutter("toTrade", {}, "navigation");
        return result;
      },

      /**
       * Navigate to Account Page
       */
      async toAccount() {
        const result = await sendMessageToFlutter(
          "toAccount",
          {},
          "navigation"
        );
        return result;
      },

      /**
       * Navigate to Trade Detail Page
       * @param {Object} params - Navigation parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {string} params.type - Trading type ('spot' or 'perp')
       */
      async toTradeDetail(params) {
        const { symbol, type } = params;

        if (!symbol || !type) {
          throw new Error("symbol and type parameters are required");
        }

        const result = await sendMessageToFlutter(
          "toTradeDetail",
          { symbol, type },
          "navigation"
        );
        return result;
      },

      /**
       * Navigate to Trade Order Page
       * @param {Object} params - Navigation parameters
       * @param {string} params.symbol - Trading pair symbol
       * @param {string} params.type - Trading type ('spot' or 'perp')
       * @param {string} params.action - Order action ('buy' or 'sell')
       */
      async toTradeOrder(params) {
        const { symbol, type, action } = params;

        if (!symbol || !type) {
          throw new Error("symbol and type parameters are required");
        }

        const result = await sendMessageToFlutter(
          "toTradeOrder",
          { symbol, type, action },
          "navigation"
        );
        return result;
      },

      /**
       * Navigate to Custom Route
       * @param {string} route - Route path
       */
      async navigateTo(route) {
        if (!route) {
          throw new Error("route parameter is required");
        }

        const result = await sendMessageToFlutter(
          "navigateTo",
          { route },
          "navigation"
        );
        return result;
      },

      /**
       * Go Back to Previous Page
       */
      async goBack() {
        const result = await sendMessageToFlutter("goBack", {}, "navigation");
        return result;
      },

      /**
       * Check if Can Go Back
       */
      async canGoBack() {
        const result = await sendMessageToFlutter(
          "canGoBack",
          {},
          "navigation"
        );
        return result;
      },

      /**
       * Get Current Route
       */
      async getCurrentRoute() {
        const result = await sendMessageToFlutter(
          "getCurrentRoute",
          {},
          "navigation"
        );
        return result;
      },
    },

    /**
     * System Related APIs
     */
    system: {
      /**
       * Refresh Page
       */
      refresh() {
        if (window.location) {
          window.location.reload();
        }
      },

      /**
       * Get SDK Version
       */
      getVersion() {
        return SDK_VERSION;
      },

      /**
       * Ping Flutter App
       */
      async ping() {
        const result = await sendMessageToFlutter("ping", {}, "system");
        return result;
      },

      /**
       * Get System Information
       */
      async getSystemInfo() {
        const result = await sendMessageToFlutter(
          "getSystemInfo",
          {},
          "system"
        );
        return result;
      },
    },

    /**
     * Utility Functions
     */
    utils: {
      /**
       * Check if SDK is Ready
       */
      isReady() {
        return isSDKReady || checkSDKReady();
      },

      /**
       * Register Ready Callback
       * @param {Function} callback - Callback function to execute when SDK is ready
       */
      onReady(callback) {
        if (typeof callback !== "function") {
          throw new Error("Callback must be a function");
        }

        if (this.isReady()) {
          // SDK is already ready, execute callback immediately
          try {
            callback();
          } catch (error) {
            console.error("Ready callback execution failed:", error);
          }
        } else {
          // SDK not ready yet, add to callback list
          readyCallbacks.push(callback);
        }
      },

      /**
       * Generate Unique ID
       */
      generateId() {
        return generateMessageId();
      },
    },
  };

  // Expose SDK to global scope
  window.HyperSolidSDK = HyperSolidSDK;

  // Auto-check SDK ready state
  function autoCheckReady() {
    if (checkSDKReady()) {
      triggerReadyCallbacks();
    } else {
      // Check again after a short delay
      setTimeout(autoCheckReady, 100);
    }
  }

  // Start auto-checking when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoCheckReady);
  } else {
    autoCheckReady();
  }

  // Listen for Flutter ready signal
  window.addEventListener("flutterReady", triggerReadyCallbacks);

  console.log("HyperSolid SDK loaded, version:", SDK_VERSION);
})(window);
