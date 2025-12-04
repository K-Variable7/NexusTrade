// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Nexus Trading Pool
/// @author Nexus Trade Team - variable.k
/// @notice Manages a pool of funds for trading strategies
/// @dev Allows users to deposit funds which are managed by a strategy executor
contract TradingPool is Ownable, ReentrancyGuard {
    IERC20 public asset;
    uint256 public totalDeposits;
    mapping(address => uint256) public balances;

    address public strategyExecutor;
    uint256 public performanceFeeBps = 2000; // 20%

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event ProfitReported(uint256 profit, uint256 fee);

    /// @notice Initializes the trading pool
    /// @param _asset The ERC20 token used for the pool
    /// @param _strategyExecutor The address authorized to execute trades
    constructor(address _asset, address _strategyExecutor) Ownable(msg.sender) {
        asset = IERC20(_asset);
        strategyExecutor = _strategyExecutor;
    }

    /// @notice Deposits assets into the pool
    /// @param amount The amount to deposit
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        asset.transferFrom(msg.sender, address(this), amount);
        balances[msg.sender] += amount;
        totalDeposits += amount;
        emit Deposit(msg.sender, amount);
    }

    /// @notice Withdraws assets from the pool
    /// @param amount The amount to withdraw
    function withdraw(uint256 amount) external nonReentrant {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        totalDeposits -= amount;
        asset.transfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    /// @notice Reports profit from trading activities
    /// @dev Can only be called by the strategy executor
    /// @param profit The amount of profit generated
    function reportProfit(uint256 profit) external {
        require(msg.sender == strategyExecutor, "Only executor");
        // Simplified logic: assume profit is already in contract or transferred here
        // In a real system, this would handle accounting of share prices etc.

        uint256 fee = (profit * performanceFeeBps) / 10000;
        // Transfer fee to owner/treasury
        asset.transfer(owner(), fee);

        emit ProfitReported(profit, fee);
    }

    /// @notice Updates the strategy executor address
    /// @param _executor The new executor address
    function setExecutor(address _executor) external onlyOwner {
        strategyExecutor = _executor;
    }
}
