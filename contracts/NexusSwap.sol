// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Nexus Swap
/// @author Nexus Trade Team - variable.k
/// @notice A decentralized exchange contract for swapping tokens with dynamic fees
/// @dev Implements basic AMM functionality with fee collection for treasury
contract NexusSwap is Ownable, ReentrancyGuard {
    IERC20 public tokenA;
    IERC20 public tokenB;

    uint256 public reserveA;
    uint256 public reserveB;

    // Fee in basis points (e.g., 30 = 0.3%)
    uint256 public feeBps = 30;
    address public treasury;

    event Swap(address indexed user, address tokenIn, uint256 amountIn, uint256 amountOut);
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);

    /// @notice Initializes the swap contract
    /// @param _tokenA Address of the first token
    /// @param _tokenB Address of the second token
    /// @param _treasury Address to receive fees
    constructor(address _tokenA, address _tokenB, address _treasury) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
        treasury = _treasury;
    }

    receive() external payable {}

    /// @notice Adds liquidity to the pool
    /// @param amountA Amount of token A to add
    /// @param amountB Amount of token B to add
    function addLiquidity(uint256 amountA, uint256 amountB) external nonReentrant {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        reserveA += amountA;
        reserveB += amountB;

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /// @notice Swaps tokens
    /// @param tokenIn Address of the input token (address(0) for ETH)
    /// @param tokenOut Address of the output token (address(0) for ETH)
    /// @param amountIn Amount of input tokens
    /// @param minAmountOut Minimum amount of output tokens
    /// @param isExternal Whether the swap is external (unused in this mock)
    /// @return amountOut The amount of output tokens received
    function swap(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 minAmountOut,
        bool isExternal
    ) external payable nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Invalid amount");
        
        bool isETHIn = tokenIn == address(0);
        bool isETHOut = tokenOut == address(0);

        // Handle ETH In
        if (isETHIn) {
            require(msg.value == amountIn, "ETH amount mismatch");
        } else {
            IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        }

        // Determine reserves (Assuming TokenA is Nexus, TokenB is WETH/ETH-equivalent)
        // If ETH is involved, we treat it as the "B" side for calculation purposes
        bool isTokenAIn = tokenIn == address(tokenA);
        
        // If ETH is in, it's like TokenB in.
        // If TokenA is in, it's TokenA in.
        
        uint256 reserveIn;
        uint256 reserveOut;
        
        if (isTokenAIn) {
            reserveIn = reserveA;
            reserveOut = reserveB; // We use reserveB to track the "other" asset (WETH or ETH)
        } else {
            // ETH or TokenB in
            reserveIn = reserveB;
            reserveOut = reserveA;
        }

        // Calculate fee
        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 amountInAfterFee = amountIn - feeAmount;

        // Send fee to treasury
        if (feeAmount > 0) {
            if (isETHIn) {
                (bool success, ) = treasury.call{value: feeAmount}("");
                require(success, "ETH fee transfer failed");
            } else {
                IERC20(tokenIn).transfer(treasury, feeAmount);
            }
        }

        // Constant Product Formula: x * y = k
        // amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee)
        // Prevent division by zero if reserves are empty (fallback for mock)
        if (reserveIn == 0 || reserveOut == 0) {
             // Mock fallback: 1:1 swap if no liquidity
             amountOut = amountInAfterFee;
        } else {
             amountOut = (amountInAfterFee * reserveOut) / (reserveIn + amountInAfterFee);
        }

        require(amountOut >= minAmountOut, "Slippage too high");

        // Update reserves
        if (isTokenAIn) {
            reserveA += amountInAfterFee;
            reserveB -= amountOut;
        } else {
            reserveB += amountInAfterFee;
            reserveA -= amountOut;
        }

        // Transfer Output
        if (isETHOut) {
            require(address(this).balance >= amountOut, "Insufficient ETH liquidity");
            (bool success, ) = payable(msg.sender).call{value: amountOut}("");
            require(success, "ETH transfer failed");
        } else {
            require(IERC20(tokenOut).balanceOf(address(this)) >= amountOut, "Insufficient token liquidity");
            IERC20(tokenOut).transfer(msg.sender, amountOut);
        }

        emit Swap(msg.sender, tokenIn, amountIn, amountOut);
    }

    /// @notice Updates the fee basis points
    /// @param _feeBps New fee in basis points
    function setFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 1000, "Fee too high"); // Max 10%
        feeBps = _feeBps;
    }

    /// @notice Updates the treasury address
    /// @param _treasury New treasury address
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }
}
