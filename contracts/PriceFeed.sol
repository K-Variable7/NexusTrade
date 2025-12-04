// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Price Feed Oracle
/// @author Nexus Trade Team - variable.k
/// @notice Provides price data for assets
/// @dev Simple oracle implementation for demonstration purposes
contract PriceFeed is Ownable {
    mapping(string => uint256) public prices;
    mapping(string => uint256) public lastUpdated;

    event PriceUpdated(string indexed symbol, uint256 price, uint256 timestamp);

    /// @notice Initializes the Price Feed contract
    constructor() Ownable(msg.sender) {}

    /// @notice Updates the price of an asset
    /// @param symbol The asset symbol (e.g., "ETH")
    /// @param price The new price (scaled by 1e18 usually)
    function updatePrice(string memory symbol, uint256 price) external onlyOwner {
        prices[symbol] = price;
        lastUpdated[symbol] = block.timestamp;
        emit PriceUpdated(symbol, price, block.timestamp);
    }

    /// @notice Retrieves the latest price of an asset
    /// @param symbol The asset symbol
    /// @return price The current price
    /// @return updatedAt The timestamp of the last update
    function getPrice(string memory symbol) external view returns (uint256 price, uint256 updatedAt) {
        return (prices[symbol], lastUpdated[symbol]);
    }
}
