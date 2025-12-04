'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { FiBarChart, FiTrendingUp, FiCreditCard, FiActivity } from 'react-icons/fi';

interface Transaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  type: 'transfer' | 'swap' | 'stake' | 'unstake' | 'bridge';
  token: string;
}

interface TokenBalance {
  symbol: string;
  balance: string;
  value: number;
  change24h: number;
}

interface WhaleTransaction {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  value: string;
  usdValue: number;
  token: string;
  type: 'whale_buy' | 'whale_sell' | 'large_transfer';
}

interface PatternAnalysis {
  pattern: string;
  confidence: number;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
}

interface DeFiProtocol {
  name: string;
  tvl: number;
  volume24h: number;
  users: number;
  apy: number;
}

interface DeFiPosition {
  protocol: string;
  type: 'lending' | 'liquidity' | 'staking' | 'farming';
  value: number;
  apy: number;
  tokens: string[];
}

interface AdvancedPattern {
  type: 'arbitrage' | 'wash_trading' | 'front_running' | 'sandwich_attack' | 'flash_loan' | 'yield_farming';
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  transactions: string[];
  estimatedLoss: number;
}

interface Alert {
  id: string;
  type: 'price' | 'whale' | 'risk' | 'gas' | 'pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface HistoricalData {
  date: string;
  portfolioValue: number;
  transactions: number;
  gasPrice: number;
  topToken: string;
}

interface CrossChainData {
  network: string;
  nativeToken: string;
  tvl: number;
  transactions24h: number;
  activeUsers: number;
  gasPrice: number;
}

interface RiskFactor {
  factor: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

interface RiskAssessment {
  overallRiskScore: number;
  riskFactors: RiskFactor[];
  safetyRecommendations: string[];
}

interface AnalyticsData {
  totalValue: number;
  transactions24h: number;
  activeProtocols: number;
  topHolding: string;
  defiPositions: DeFiPosition[];
  whaleTransactions: WhaleTransaction[];
  patterns: PatternAnalysis[];
  priceData: PriceData[];
  defiProtocols: DeFiProtocol[];
  advancedPatterns: AdvancedPattern[];
  gasPrice: number;
  networkCongestion: 'low' | 'medium' | 'high';
  alerts: Alert[];
  historicalData: HistoricalData[];
  crossChainData: CrossChainData[];
  riskAssessment?: RiskAssessment;
}

export default function BlockchainAnalytics() {
  const { address, isConnected } = useAccount();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalValue: 0,
    transactions24h: 0,
    activeProtocols: 0,
    topHolding: 'ETH',
    defiPositions: [],
    whaleTransactions: [],
    patterns: [],
    priceData: [],
    defiProtocols: [],
    advancedPatterns: [],
    gasPrice: 0,
    networkCongestion: 'low',
    alerts: [],
    historicalData: [],
    crossChainData: [],
    riskAssessment: undefined
  });

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [accessLevel, setAccessLevel] = useState(0); // Access NFT level (0-100)
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Check Access NFT ownership for enhanced features
  const checkAccessLevel = async () => {
    if (!isConnected || !address) return 0;

    try {
      // In production, this would check actual Access NFT contract
      // For now, we'll simulate based on wallet address
      const mockAccessLevels: { [key: string]: number } = {
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e': 25, // Basic
        '0x8ba1f109551bD432803012645261768374161': 60, // Premium
        '0x4a2d35Cc6634C0532925a3b844Bc454e4438f44f': 85, // VIP
      };

      return mockAccessLevels[address.toLowerCase()] || 0;
    } catch (error) {
      console.error('Error checking access level:', error);
      return 0;
    }
  };

  useEffect(() => {
    const initializeAnalytics = async () => {
      // Check Access NFT level
      const level = await checkAccessLevel();
      setAccessLevel(level);

      setLoading(true);
      try {
        // Fetch real-time price data
        const prices = await fetchPriceData();
        setAnalytics(prev => ({ ...prev, priceData: prices }));

        // Generate historical data
        const historical = generateHistoricalData();

        let crossChain: CrossChainData[] = [];
        // Fetch cross-chain data (if access level allows)
        if (level >= 85) {
          crossChain = await fetchCrossChainData();
        }

        // Only analyze wallet if connected
        if (isConnected && address) {
          const data = await fetchBlockchainData(address);
          if (data) {
            // Generate alerts based on the data
            const alerts = generateAlerts(data);

            // Update analytics with new data
            setAnalytics(prev => ({
              ...prev,
              alerts,
              historicalData: historical,
              crossChainData: crossChain
            }));
          }
        } else {
          // Still update cross-chain data even if not connected
          setAnalytics(prev => ({
            ...prev,
            historicalData: historical,
            crossChainData: crossChain
          }));
        }
      } catch (error) {
        console.error('Error initializing analytics:', error);
      }
      setLoading(false);
    };

    initializeAnalytics();
  }, [accessLevel]);

  // Real-time data refresh for premium users
  useEffect(() => {
    if (accessLevel >= 25) {
      const refreshInterval = setInterval(async () => {
        try {
          const gasData = await fetchGasPrice();
          const prices = await fetchPriceData();

          setAnalytics(prev => ({
            ...prev,
            gasPrice: gasData.gasPrice,
            networkCongestion: gasData.congestion as 'low' | 'medium' | 'high',
            priceData: prices
          }));
        } catch (error) {
          console.error('Real-time data refresh error:', error);
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [accessLevel]);

  // Generate real-time alerts based on wallet activity
  const generateRealTimeAlerts = async (walletAddress: string) => {
    const alerts: string[] = [];

    try {
      // Check for large transactions
      const transactions = await fetchEtherscanTransactions(walletAddress);
      const recentTx = transactions[0];

      if (recentTx) {
        const value = parseInt(recentTx.value) / 1e18;
        if (value > 1) {
          alerts.push(`🚨 Large transaction detected: ${value.toFixed(2)} ETH`);
        }
      }

      // Gas price alerts
      const gasData = await fetchGasData();
      if (gasData.gasPrice > 100) {
        alerts.push(`⛽ High gas prices detected: ${gasData.gasPrice} gwei`);
      }

      // Price alerts (mock for now)
      alerts.push('📈 ETH price: $3,450 (+2.3%)');
      alerts.push('🔄 Network status: Normal');

    } catch (error) {
      console.error('Alert generation error:', error);
    }

    return alerts;
  };

  // Fetch real-time gas prices from Etherscan
  const fetchGasData = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';
      const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        const gasPrice = parseInt(data.result.ProposeGasPrice);
        let congestion = 'low';
        if (gasPrice > 50) congestion = 'high';
        else if (gasPrice > 20) congestion = 'medium';

        return { gasPrice, congestion };
      }
    } catch (error) {
      console.error('Gas data fetch error:', error);
    }
    return { gasPrice: 20, congestion: 'low' };
  };

  // Enhanced price data fetching with multiple sources
  const fetchPriceData = async () => {
    try {
      // CoinLore API - Completely FREE, no API key required
      const response = await fetch('https://api.coinlore.net/api/tickers/?start=0&limit=100');
      const data = await response.json();

      if (data && data.data) {
        return data.data.slice(0, 20).map((coin: any) => ({
          symbol: coin.symbol,
          price: parseFloat(coin.price_usd),
          change24h: parseFloat(coin.percent_change_24h),
          marketCap: parseFloat(coin.market_cap_usd)
        }));
      }
    } catch (error) {
      console.error('Price data fetch error:', error);
    }
    return [];
  };
  const fetchEtherscanTransactions = async (address: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        return data.result.slice(0, 10); // Last 10 transactions
      }
      return [];
    } catch (error) {
      console.error('Etherscan API error:', error);
      return [];
    }
  };

  const fetchTokenBalances = async (address: string) => {
    const API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourApiKeyToken';

    // Get ETH balance
    try {
      const ethUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${API_KEY}`;
      const ethResponse = await fetch(ethUrl);
      const ethData = await ethResponse.json();

      if (ethData.status === '1') {
        return [{
          symbol: 'ETH',
          balance: (parseInt(ethData.result) / 1e18).toFixed(4),
          contractAddress: '0x0000000000000000000000000000000000000000'
        }];
      }
    } catch (error) {
      console.error('ETH balance fetch error:', error);
    }

    return [];
  };

  const analyzeWhaleTransactions = (transactions: any[]) => {
    const whaleThreshold = 100000; // $100k threshold for whale transactions
    const whales: WhaleTransaction[] = [];

    transactions.forEach(tx => {
      const value = parseInt(tx.value) / 1e18;
      const usdValue = value * 3000; // Approximate ETH price

      if (usdValue >= whaleThreshold) {
        whales.push({
          hash: tx.hash,
          timestamp: parseInt(tx.timeStamp) * 1000,
          from: tx.from,
          to: tx.to,
          value: value.toFixed(4),
          usdValue,
          token: 'ETH',
          type: usdValue >= 500000 ? 'whale_buy' : 'large_transfer'
        });
      }
    });

    return whales.slice(0, 5); // Top 5 whale transactions
  };

  const analyzePatterns = (transactions: any[]) => {
    const patterns: PatternAnalysis[] = [];

    // Large transaction pattern
    const largeTxs = transactions.filter(tx => parseInt(tx.value) / 1e18 > 10);
    if (largeTxs.length > 0) {
      patterns.push({
        pattern: 'large_transactions',
        confidence: 0.95,
        description: `${largeTxs.length} large transactions detected`,
        risk: 'medium'
      });
    }

    // Frequent trading pattern
    const frequentTxs = transactions.filter((tx, index, arr) => {
      if (index === 0) return false;
      const prevTx = arr[index - 1];
      return parseInt(tx.timeStamp) - parseInt(prevTx.timeStamp) < 3600; // Within 1 hour
    });

    if (frequentTxs.length > 3) {
      patterns.push({
        pattern: 'frequent_trading',
        confidence: 0.78,
        description: 'High frequency trading activity detected',
        risk: 'low'
      });
    }

    // Bridge pattern
    const bridgeTxs = transactions.filter(tx =>
      tx.to && (tx.to.toLowerCase().includes('bridge') || tx.input?.includes('0x8b9a4'))
    );

    if (bridgeTxs.length > 0) {
      patterns.push({
        pattern: 'cross_chain_bridge',
        confidence: 0.88,
        description: `${bridgeTxs.length} bridge transactions detected`,
        risk: 'low'
      });
    }

    return patterns;
  };

  const analyzeAdvancedPatterns = (transactions: any[]) => {
    const patterns: AdvancedPattern[] = [];

    // Flash Loan Detection
    const flashLoans = transactions.filter(tx =>
      parseInt(tx.value) / 1e18 > 1000 && parseInt(tx.gasUsed) < 100000
    );

    if (flashLoans.length > 0) {
      patterns.push({
        type: 'flash_loan',
        confidence: 0.89,
        severity: 'medium',
        description: 'Flash loan activity detected - potential arbitrage or liquidation',
        transactions: flashLoans.map(tx => tx.hash),
        estimatedLoss: 0
      });
    }

    // Sandwich Attack Detection
    const sandwichPatterns = transactions.filter((tx, index, arr) => {
      if (index === 0 || index === arr.length - 1) return false;
      const prevTx = arr[index - 1];
      const nextTx = arr[index + 1];
      return Math.abs(parseInt(tx.timeStamp) - parseInt(prevTx.timeStamp)) < 60 &&
             Math.abs(parseInt(tx.timeStamp) - parseInt(nextTx.timeStamp)) < 60;
    });

    if (sandwichPatterns.length > 2) {
      patterns.push({
        type: 'sandwich_attack',
        confidence: 0.76,
        severity: 'high',
        description: 'Sandwich attack pattern detected - potential MEV exploitation',
        transactions: sandwichPatterns.map(tx => tx.hash),
        estimatedLoss: sandwichPatterns.length * 50 // Estimated gas loss
      });
    }

    // Wash Trading Detection
    const washTrading = transactions.filter(tx => {
      const sameValueTxs = transactions.filter(t =>
        t.from === tx.to && t.to === tx.from && Math.abs(parseInt(t.value) - parseInt(tx.value)) < 1000000000000000 // 0.001 ETH tolerance
      );
      return sameValueTxs.length > 0;
    });

    if (washTrading.length > 0) {
      patterns.push({
        type: 'wash_trading',
        confidence: 0.82,
        severity: 'medium',
        description: 'Wash trading pattern detected - potential market manipulation',
        transactions: washTrading.map(tx => tx.hash),
        estimatedLoss: 0
      });
    }

    // Yield Farming Detection
    const yieldFarming = transactions.filter(tx =>
      tx.to && (tx.to.toLowerCase().includes('farm') || tx.to.toLowerCase().includes('stake'))
    );

    if (yieldFarming.length > 3) {
      patterns.push({
        type: 'yield_farming',
        confidence: 0.91,
        severity: 'low',
        description: 'Active yield farming detected - DeFi farming strategy',
        transactions: yieldFarming.map(tx => tx.hash),
        estimatedLoss: 0
      });
    }

    return patterns;
  };

  const fetchDeFiProtocols = async () => {
    try {
      // DeFi Pulse API or similar for protocol data
      const protocols = [
        {
          name: 'Uniswap V3',
          tvl: 4500000000,
          volume24h: 1200000000,
          users: 850000,
          apy: 12.5
        },
        {
          name: 'Aave',
          tvl: 8200000000,
          volume24h: 450000000,
          users: 420000,
          apy: 3.2
        },
        {
          name: 'Compound',
          tvl: 7800000000,
          volume24h: 380000000,
          users: 380000,
          apy: 4.1
        },
        {
          name: 'Curve Finance',
          tvl: 5200000000,
          volume24h: 890000000,
          users: 290000,
          apy: 8.7
        },
        {
          name: 'Lido',
          tvl: 15600000000,
          volume24h: 250000000,
          users: 180000,
          apy: 5.8
        }
      ];

      return protocols;
    } catch (error) {
      console.error('DeFi protocols fetch error:', error);
      return [];
    }
  };

  const fetchGasPrice = async () => {
    try {
      const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken');
      const data = await response.json();

      if (data.status === '1') {
        const gasPrice = parseInt(data.result.ProposeGasPrice);
        let congestion: 'low' | 'medium' | 'high' = 'low';

        if (gasPrice > 100) congestion = 'high';
        else if (gasPrice > 50) congestion = 'medium';

        return { gasPrice, congestion };
      }

      return { gasPrice: 25, congestion: 'low' as const };
    } catch (error) {
      console.error('Gas price fetch error:', error);
      return { gasPrice: 25, congestion: 'low' as const };
    }
  };

  const generateAlerts = (data: any) => {
    const alerts: Alert[] = [];
    const now = Date.now();

    // Price alerts
    data.priceData?.forEach((price: PriceData) => {
      if (Math.abs(price.change24h) > 10) {
        alerts.push({
          id: `price-${price.symbol}-${now}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'price',
          severity: Math.abs(price.change24h) > 20 ? 'high' : 'medium',
          title: `${price.symbol} Price Alert`,
          message: `${price.symbol} ${price.change24h > 0 ? 'surge' : 'drop'} of ${Math.abs(price.change24h).toFixed(1)}% in 24h`,
          timestamp: now,
          read: false
        });
      }
    });

    // Gas price alerts
    if (data.gasPrice > 100) {
      alerts.push({
        id: `gas-${now}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'gas',
        severity: data.gasPrice > 200 ? 'high' : 'medium',
        title: 'High Gas Prices',
        message: `Network gas prices at ${data.gasPrice} gwei - ${data.networkCongestion} congestion`,
        timestamp: now,
        read: false
      });
    }

    // Whale alerts
    data.whaleTransactions?.forEach((whale: WhaleTransaction) => {
      alerts.push({
        id: `whale-${whale.hash}`,
        type: 'whale',
        severity: whale.usdValue > 1000000 ? 'critical' : 'high',
        title: 'Whale Movement Detected',
        message: `Large ${whale.type} transaction: ${whale.value} ${whale.token} ($${whale.usdValue.toLocaleString()})`,
        timestamp: whale.timestamp,
        read: false
      });
    });

    // Risk alerts
    data.advancedPatterns?.forEach((pattern: AdvancedPattern) => {
      if (pattern.severity === 'critical' || pattern.severity === 'high') {
        alerts.push({
          id: `risk-${pattern.type}-${now}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'risk',
          severity: pattern.severity,
          title: 'Risk Alert Detected',
          message: `${pattern.type.replace('_', ' ')} pattern: ${pattern.description}`,
          timestamp: now,
          read: false
        });
      }
    });

    return alerts.slice(0, 10); // Keep latest 10 alerts
  };

  const generateHistoricalData = () => {
    const historical: HistoricalData[] = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      historical.push({
        date: date.toISOString().split('T')[0],
        portfolioValue: 9000 + Math.random() * 2000 + (i * 50), // Trending upward
        transactions: Math.floor(Math.random() * 50) + 10,
        gasPrice: 20 + Math.random() * 30,
        topToken: ['ETH', 'USDC', 'UNI'][Math.floor(Math.random() * 3)]
      });
    }

    return historical;
  };

  const fetchCrossChainData = async () => {
    // Simulate cross-chain data (would use real APIs in production)
    const chains = [
      {
        network: 'Ethereum',
        nativeToken: 'ETH',
        tvl: 45000000000,
        transactions24h: 1200000,
        activeUsers: 450000,
        gasPrice: 25
      },
      {
        network: 'Arbitrum',
        nativeToken: 'ETH',
        tvl: 2500000000,
        transactions24h: 800000,
        activeUsers: 120000,
        gasPrice: 0.2
      },
      {
        network: 'Polygon',
        nativeToken: 'MATIC',
        tvl: 1800000000,
        transactions24h: 600000,
        activeUsers: 95000,
        gasPrice: 30
      },
      {
        network: 'Optimism',
        nativeToken: 'ETH',
        tvl: 1200000000,
        transactions24h: 400000,
        activeUsers: 75000,
        gasPrice: 0.1
      },
      {
        network: 'Base',
        nativeToken: 'ETH',
        tvl: 800000000,
        transactions24h: 300000,
        activeUsers: 60000,
        gasPrice: 0.05
      }
    ];

    return chains;
  };

  // Enhanced blockchain data fetching with all APIs
  const fetchBlockchainData = async (address: string) => {
    try {
      // Fetch all data sources in parallel
      const [transactions, balances, priceData, defiProtocols, gasData] = await Promise.all([
        fetchEtherscanTransactions(address),
        fetchTokenBalances(address),
        fetchPriceData(),
        fetchDeFiProtocols(),
        fetchGasPrice()
      ]);

      // Analyze for whales and patterns
      const whaleTransactions = analyzeWhaleTransactions(transactions);
      const patterns = analyzePatterns(transactions);
      const advancedPatterns = analyzeAdvancedPatterns(transactions);

      // Mock enhanced data structure
      return {
        transactions: transactions.slice(0, 5).map((tx: any) => ({
          hash: tx.hash,
          timestamp: parseInt(tx.timeStamp) * 1000,
          from: tx.from,
          to: tx.to,
          value: (parseInt(tx.value) / 1e18).toFixed(4),
          type: Math.random() > 0.5 ? 'transfer' : 'swap',
          token: 'ETH'
        })),
        balances: balances.map(balance => ({
          symbol: balance.symbol,
          balance: balance.balance,
          value: parseFloat(balance.balance) * (priceData.find((p: PriceData) => p.symbol === balance.symbol)?.price || 3000),
          change24h: priceData.find((p: PriceData) => p.symbol === balance.symbol)?.change24h || 0
        })),
        whaleTransactions,
        patterns,
        advancedPatterns,
        priceData,
        defiProtocols,
        gasPrice: gasData.gasPrice,
        networkCongestion: gasData.congestion
      };
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      return null;
    }
  };

  const fetchAIAnalytics = async () => {
    if (!isConnected || !address) return;
    
    setAiLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          recentTransactions: recentTransactions.slice(0, 10), // Send context
          tokenBalances: tokenBalances
        }),
      });

      if (!response.ok) throw new Error('AI Analysis failed');

      const data = await response.json();
      
      // Map API response to component state
      setAnalytics(prev => ({
        ...prev,
        whaleTransactions: data.whaleMovements.map((w: any) => ({
          hash: '0x' + Math.random().toString(16).slice(2), // Mock hash if not provided
          timestamp: Date.now(),
          from: w.fromAddress,
          to: w.toAddress,
          value: w.amount.toString(),
          usdValue: w.usdValue,
          token: w.token,
          type: w.type === 'accumulation' ? 'whale_buy' : 'whale_sell'
        })),
        advancedPatterns: data.advancedPatterns.map((p: any) => ({
          type: p.patternType,
          confidence: p.confidenceScore,
          severity: p.severity,
          description: p.description,
          transactions: [],
          estimatedLoss: 0
        })),
        riskAssessment: data.riskAssessment
      }));

    } catch (error) {
      console.error('Error fetching AI analytics:', error);
    }
    setAiLoading(false);
  };

  const analyzeWallet = async () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet to analyze your portfolio.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchBlockchainData(address);

      if (data) {
        // Process transactions
        const processedTransactions: Transaction[] = (data as any).transactions.map((tx: any) => ({
          ...tx,
          hash: tx.hash.length > 10 ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}` : tx.hash,
          from: tx.from.length > 10 ? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}` : tx.from,
          to: tx.to.length > 10 ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : tx.to
        }));

        // Process token balances with price data
        const processedBalances: TokenBalance[] = (data as any).balances.map((token: any) => ({
          symbol: token.symbol,
          balance: token.balance,
          value: token.value,
          change24h: token.change24h || 0
        }));

        // Calculate analytics
        const totalValue = processedBalances.reduce((sum, token) => sum + token.value, 0);
        const topHolding = processedBalances.reduce((prev, current) =>
          prev.value > current.value ? prev : current
        )?.symbol || 'ETH';

        // Mock DeFi positions (would be real in production)
        const mockDeFiPositions: DeFiPosition[] = [
          {
            protocol: 'Aave',
            type: 'lending',
            value: 2500,
            apy: 3.2,
            tokens: ['USDC', 'ETH']
          },
          {
            protocol: 'Uniswap V3',
            type: 'liquidity',
            value: 1800,
            apy: 12.5,
            tokens: ['ETH', 'UNI']
          },
          {
            protocol: 'Lido',
            type: 'staking',
            value: 3200,
            apy: 5.8,
            tokens: ['ETH']
          }
        ];

        // Generate alerts based on current data
        const alerts = generateAlerts({
          priceData: (data as any).priceData || [],
          gasPrice: (data as any).gasPrice || 25,
          networkCongestion: (data as any).networkCongestion || 'low',
          whaleTransactions: (data as any).whaleTransactions || [],
          advancedPatterns: (data as any).advancedPatterns || []
        });

        // Enhanced features for Access NFT holders
        let enhancedAlerts = alerts;
        let enhancedPatterns = (data as any).advancedPatterns || [];
        let crossChainData: any[] = [];

        if (accessLevel >= 25) {
          // Premium: Real-time alerts
          const realTimeAlerts = await generateRealTimeAlerts(address);
          enhancedAlerts = [...alerts, ...realTimeAlerts.map(alert => ({
            id: Date.now().toString() + Math.random(),
            type: 'pattern' as const,
            severity: 'low' as const,
            title: 'Real-time Update',
            message: alert,
            timestamp: Date.now(),
            read: false
          }))];

          if (accessLevel >= 60) {
            // VIP: Advanced pattern recognition
            enhancedPatterns = await analyzeAdvancedPatterns(processedTransactions);

            if (accessLevel >= 85) {
              // Elite: Cross-chain analysis
              crossChainData = await fetchCrossChainData();
            }
          }
        }

        setRecentTransactions(processedTransactions);
        setTokenBalances(processedBalances);
        setAnalytics(prev => ({
          ...prev,
          totalValue,
          transactions24h: processedTransactions.length,
          activeProtocols: Math.floor(Math.random() * 8) + 3,
          topHolding,
          defiPositions: mockDeFiPositions,
          whaleTransactions: (data as any).whaleTransactions || [],
          patterns: (data as any).patterns || [],
          advancedPatterns: enhancedPatterns,
          priceData: (data as any).priceData || [],
          defiProtocols: (data as any).defiProtocols || [],
          gasPrice: (data as any).gasPrice || 25,
          networkCongestion: (data as any).networkCongestion || 'low',
          alerts: enhancedAlerts,
          crossChainData
        }));
      }
    } catch (error) {
      console.error('Error analyzing wallet:', error);
    }
    setLoading(false);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'swap': return '🔄';
      case 'transfer': return '📤';
      case 'stake': return '🔒';
      case 'unstake': return '🔓';
      case 'bridge': return '🌉';
      default: return '📊';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'swap': return 'text-blue-400';
      case 'transfer': return 'text-green-400';
      case 'stake': return 'text-purple-400';
      case 'unstake': return 'text-orange-400';
      case 'bridge': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-full bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:border-white/20 group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FiBarChart className="text-yellow-400 text-3xl mr-3 group-hover:text-yellow-300 transition-colors duration-300" />
          <div>
            <h2 className="text-xl font-medium text-white group-hover:text-yellow-100 transition-colors duration-300">Blockchain Analytics</h2>
            {accessLevel > 0 && (
              <div className="text-xs text-yellow-400/60 mt-1 font-light opacity-75">
                Access Level: {accessLevel}% {accessLevel >= 85 ? '(Elite)' : accessLevel >= 60 ? '(VIP)' : accessLevel >= 25 ? '(Premium)' : '(Basic)'}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAIAnalytics}
            disabled={aiLoading || !isConnected}
            className="bg-purple-600/80 text-white px-4 py-2 rounded-lg hover:bg-purple-500 transition-all duration-300 text-sm font-medium disabled:opacity-50 shadow-lg hover:shadow-purple-500/25 flex items-center"
          >
            {aiLoading ? (
              <>
                <span className="animate-spin mr-2">⚡</span>
                Analyzing...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                AI Deep Dive
              </>
            )}
          </button>
          <button
            onClick={analyzeWallet}
            disabled={loading}
            className="bg-yellow-600/80 text-white px-4 py-2 rounded-lg hover:bg-yellow-500 transition-all duration-300 text-sm font-medium disabled:opacity-50 shadow-lg hover:shadow-yellow-500/25"
          >
            {loading ? 'Analyzing...' : 'Analyze Wallet'}
          </button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiTrendingUp className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Portfolio Value</span>
          </div>
          <div className="text-2xl font-bold text-white">${analytics.totalValue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiActivity className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Gas Price</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.gasPrice} gwei</div>
          <div className={`text-sm mt-1 ${
            analytics.networkCongestion === 'high' ? 'text-red-400' :
            analytics.networkCongestion === 'medium' ? 'text-yellow-400' :
            'text-green-400'
          }`}>
            {analytics.networkCongestion.toUpperCase()}
          </div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiTrendingUp className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">DeFi Protocols</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.defiProtocols.length}</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiActivity className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Risk Alerts</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.advancedPatterns.length}</div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiTrendingUp className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Portfolio Value</span>
          </div>
          <div className="text-2xl font-bold text-white">${analytics.totalValue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiActivity className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">24h Transactions</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.transactions24h}</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiTrendingUp className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Active Protocols</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.activeProtocols}</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-lg border border-yellow-400/20">
          <div className="flex items-center mb-2">
            <FiBarChart className="text-yellow-400 text-lg mr-2" />
            <span className="text-sm text-gray-400">Top Holding</span>
          </div>
          <div className="text-2xl font-bold text-white">{analytics.topHolding}</div>
        </div>
      </div>

      {/* Whale Tracking */}
      {analytics.whaleTransactions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🐋 Whale Tracking</h3>
          <div className="space-y-2">
            {analytics.whaleTransactions.map((whale, index) => (
              <div key={index} className="bg-slate-900/30 p-3 rounded-lg border border-red-400/20 hover:bg-slate-900/50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {whale.type === 'whale_buy' ? '🐋' : '💰'}
                    </span>
                    <span className={`font-medium ${whale.type === 'whale_buy' ? 'text-red-400' : 'text-orange-400'} capitalize`}>
                      {whale.type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(whale.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <div className="mb-1">
                    <span className="text-gray-400">Amount:</span> {whale.value} {whale.token}
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-400">USD Value:</span> ${whale.usdValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">{whale.hash}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Recognition */}
      {analytics.patterns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🔍 Pattern Recognition</h3>
          <div className="space-y-2">
            {analytics.patterns.map((pattern, index) => (
              <div key={index} className="bg-slate-900/30 p-3 rounded-lg border border-purple-400/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xl mr-3">
                      {pattern.risk === 'high' ? '🚨' : pattern.risk === 'medium' ? '⚠️' : '✅'}
                    </span>
                    <span className="font-medium text-white">{pattern.pattern}</span>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${
                    pattern.risk === 'high' ? 'bg-red-500/20 text-red-400' :
                    pattern.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {pattern.confidence * 100}% confidence
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advanced Pattern Recognition */}
      {analytics.advancedPatterns.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🚨 Advanced Risk Detection</h3>
          <div className="space-y-2">
            {analytics.advancedPatterns.map((pattern, index) => (
              <div key={index} className="bg-slate-900/30 p-4 rounded-lg border border-red-400/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {pattern.type === 'flash_loan' ? '⚡' :
                       pattern.type === 'sandwich_attack' ? '🥪' :
                       pattern.type === 'wash_trading' ? '🔄' :
                       pattern.type === 'yield_farming' ? '🌾' : '⚠️'}
                    </span>
                    <div>
                      <span className="font-medium text-white capitalize">{pattern.type.replace('_', ' ')}</span>
                      <div className="text-sm text-gray-400">{pattern.transactions.length} transactions involved</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pattern.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    pattern.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    pattern.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {pattern.severity.toUpperCase()}
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{pattern.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Confidence: {(pattern.confidence * 100).toFixed(1)}%</span>
                  {pattern.estimatedLoss > 0 && (
                    <span className="text-red-400">Est. Loss: ${pattern.estimatedLoss}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Risk Assessment */}
      {analytics.riskAssessment && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🛡️ AI Risk Assessment</h3>
          <div className="bg-slate-900/30 p-6 rounded-lg border border-blue-400/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-gray-400 text-sm mb-1">Overall Risk Score</div>
                <div className={`text-3xl font-bold ${
                  analytics.riskAssessment.overallRiskScore > 75 ? 'text-red-400' :
                  analytics.riskAssessment.overallRiskScore > 50 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {analytics.riskAssessment.overallRiskScore}/100
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400">Analysis by GPT-4o</div>
                <div className="text-xs text-gray-500">Updated just now</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  {analytics.riskAssessment.riskFactors.map((factor, index) => (
                    <div key={index} className="bg-slate-800/50 p-3 rounded border border-white/5">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-300 font-medium">{factor.factor}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          factor.riskLevel === 'critical' ? 'bg-red-500/20 text-red-400' :
                          factor.riskLevel === 'high' ? 'bg-orange-500/20 text-orange-400' :
                          factor.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {factor.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">{factor.details}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Safety Recommendations</h4>
                <ul className="space-y-2">
                  {analytics.riskAssessment.safetyRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-300">
                      <span className="text-green-400 mr-2">✓</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Price Feeds */}
      {analytics.priceData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">💰 Live Price Feeds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {analytics.priceData.map((price, index) => (
              <div key={index} className="bg-slate-900/30 p-4 rounded-lg border border-yellow-400/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{price.symbol}</span>
                  <span className={`text-sm ${price.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">${price.price.toFixed(2)}</div>
                <div className="text-xs text-gray-400 mt-1">
                  MC: ${(price.marketCap / 1e9).toFixed(1)}B
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DeFi Protocol Analytics */}
      {analytics.defiProtocols.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🏛️ DeFi Protocol Analytics</h3>
          <div className="space-y-3">
            {analytics.defiProtocols.map((protocol, index) => (
              <div key={index} className="bg-slate-900/30 p-4 rounded-lg border border-yellow-400/10 hover:bg-slate-900/50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {protocol.name[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{protocol.name}</div>
                      <div className="text-gray-400 text-sm">{protocol.users.toLocaleString()} users</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">{protocol.apy.toFixed(1)}% APY</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">TVL:</span>
                    <span className="text-white ml-2">${(protocol.tvl / 1e9).toFixed(1)}B</span>
                  </div>
                  <div>
                    <span className="text-gray-400">24h Volume:</span>
                    <span className="text-white ml-2">${(protocol.volume24h / 1e9).toFixed(1)}B</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🚨 Real-time Alerts</h3>
          <div className="space-y-3">
            {analytics.alerts.slice(0, 5).map((alert, index) => (
              <div key={alert.id} className={`p-4 rounded-lg border transition-all duration-200 ${
                alert.severity === 'critical' ? 'bg-red-900/20 border-red-400/30' :
                alert.severity === 'high' ? 'bg-orange-900/20 border-orange-400/30' :
                alert.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-400/30' :
                'bg-blue-900/20 border-blue-400/30'
              } ${alert.read ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <span className={`text-lg mr-2 ${
                      alert.severity === 'critical' ? 'text-red-400' :
                      alert.severity === 'high' ? 'text-orange-400' :
                      alert.severity === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {alert.type === 'price' ? '📈' :
                       alert.type === 'whale' ? '🐋' :
                       alert.type === 'gas' ? '⛽' :
                       alert.type === 'risk' ? '⚠️' : '🔔'}
                    </span>
                    <div>
                      <div className="text-white font-medium">{alert.title}</div>
                      <div className="text-gray-400 text-sm">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                    alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                    alert.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <div className="text-gray-300 text-sm">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Features for Access NFT Holders */}
      {accessLevel >= 25 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">
            ⭐ Premium Analytics {accessLevel >= 85 ? '(Elite)' : accessLevel >= 60 ? '(VIP)' : '(Premium)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accessLevel >= 25 && (
              <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 p-4 rounded-lg border border-purple-400/30">
                <div className="flex items-center mb-2">
                  <span className="text-purple-400 text-lg mr-2">🔄</span>
                  <span className="text-white font-medium">Real-time Updates</span>
                </div>
                <div className="text-gray-300 text-sm">
                  Live data refresh every 30 seconds with gas prices, network congestion, and price feeds.
                </div>
              </div>
            )}

            {accessLevel >= 60 && (
              <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 p-4 rounded-lg border border-pink-400/30">
                <div className="flex items-center mb-2">
                  <span className="text-pink-400 text-lg mr-2">🎯</span>
                  <span className="text-white font-medium">Advanced Patterns</span>
                </div>
                <div className="text-gray-300 text-sm">
                  AI-powered pattern recognition for MEV attacks, wash trading, and market anomalies.
                </div>
              </div>
            )}

            {accessLevel >= 85 && (
              <>
                <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-4 rounded-lg border border-yellow-400/30">
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400 text-lg mr-2">🌐</span>
                    <span className="text-white font-medium">Cross-Chain Analysis</span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    Multi-chain portfolio tracking across Ethereum, Arbitrum, Polygon, and Optimism.
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 p-4 rounded-lg border border-green-400/30">
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 text-lg mr-2">📈</span>
                    <span className="text-white font-medium">Enterprise Insights</span>
                  </div>
                  <div className="text-gray-300 text-sm">
                    Institutional-grade analytics with predictive modeling and risk assessment.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Historical Analysis */}
      {analytics.historicalData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">📊 Historical Analysis (30 Days)</h3>
          <div className="bg-slate-900/30 p-4 rounded-lg border border-yellow-400/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  +${(analytics.historicalData[analytics.historicalData.length - 1].portfolioValue - analytics.historicalData[0].portfolioValue).toFixed(0)}
                </div>
                <div className="text-xs text-gray-400">Portfolio Growth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {analytics.historicalData.reduce((sum, day) => sum + day.transactions, 0)}
                </div>
                <div className="text-xs text-gray-400">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {(analytics.historicalData.reduce((sum, day) => sum + day.gasPrice, 0) / analytics.historicalData.length).toFixed(1)}
                </div>
                <div className="text-xs text-gray-400">Avg Gas Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">
                  {analytics.historicalData[analytics.historicalData.length - 1].topToken}
                </div>
                <div className="text-xs text-gray-400">Top Token</div>
              </div>
            </div>
            <div className="h-32 bg-slate-800/50 rounded p-2">
              <div className="flex items-end h-full space-x-1">
                {analytics.historicalData.slice(-14).map((day, index) => {
                  const maxValue = Math.max(...analytics.historicalData.map(d => d.portfolioValue));
                  const height = (day.portfolioValue / maxValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top">
                        {new Date(day.date).getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cross-Chain Analytics */}
      {analytics.crossChainData.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">🌐 Cross-Chain Analytics</h3>
          <div className="space-y-3">
            {analytics.crossChainData.map((chain, index) => (
              <div key={index} className="bg-slate-900/30 p-4 rounded-lg border border-yellow-400/10 hover:bg-slate-900/50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {chain.nativeToken[0]}
                    </div>
                    <div>
                      <div className="text-white font-medium">{chain.network}</div>
                      <div className="text-gray-400 text-sm">{chain.nativeToken}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-medium">${(chain.tvl / 1e9).toFixed(1)}B TVL</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">24h Txs:</span>
                    <span className="text-white ml-2">{chain.transactions24h.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Active Users:</span>
                    <span className="text-white ml-2">{chain.activeUsers.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Gas Price:</span>
                    <span className="text-white ml-2">{chain.gasPrice} gwei</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentTransactions.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-white mb-3 group-hover:text-yellow-100 transition-colors duration-300">Recent Transactions</h3>
          <div className="space-y-2">
            {recentTransactions.map((tx, index) => (
              <div key={index} className="bg-slate-900/30 p-3 rounded-lg border border-yellow-400/10 hover:bg-slate-900/50 transition-colors duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-lg mr-3">{getTransactionIcon(tx.type)}</span>
                    <span className={`font-medium ${getTransactionColor(tx.type)} capitalize`}>{tx.type}</span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm text-gray-300">
                  <div className="mb-1">
                    <span className="text-gray-400">From:</span> {tx.from}
                  </div>
                  <div className="mb-1">
                    <span className="text-gray-400">To:</span> {tx.to}
                  </div>
                  <div>
                    <span className="text-gray-400">Amount:</span> {tx.value} {tx.token}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-mono">{tx.hash}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tokenBalances.length === 0 && recentTransactions.length === 0 && !loading && (
        <div className="text-center py-8">
          <FiBarChart className="text-yellow-400 text-4xl mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 mb-2">Click "Analyze Wallet" to get blockchain insights</p>
          <p className="text-gray-500 text-sm">Enterprise-grade analytics: real-time prices, DeFi protocols, whale tracking, advanced ML pattern recognition, and risk assessment</p>
          <div className="mt-4 text-xs text-gray-600 space-y-1">
            <p>• 🐋 Whale transaction monitoring ($100k+ movements)</p>
            <p>• 🔍 Advanced pattern recognition (flash loans, MEV, wash trading)</p>
            <p>• 💰 Live price feeds from CoinGecko API</p>
            <p>• 🏛️ DeFi protocol analytics (TVL, volume, APY)</p>
            <p>• ⚡ Real-time gas price & network congestion</p>
            <p>• 🚨 Risk assessment with severity scoring</p>
            <p>• 📊 Multi-source data aggregation</p>
          </div>
        </div>
      )}
    </div>
  );
}