// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Nexus Token
/// @author Nexus Trade Team - variable.k
/// @notice The native governance and utility token of the Nexus Trade ecosystem
/// @dev Implements adaptive fee mechanics based on trading volume
contract NexusToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // 100 Million
    
    address public treasuryWallet;
    address public liquidityWallet;
    
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public buyFee = 300; // 3%
    uint256 public sellFee = 300; // 3%
    
    mapping(address => bool) public isExcludedFromFees;
    mapping(address => uint256) public volumeStats;

    event FeesUpdated(uint256 newBuyFee, uint256 newSellFee);
    event WalletsUpdated(address newTreasury, address newLiquidity);

    constructor(address initialOwner, address _treasury, address _liquidity) 
        ERC20("Nexus Token", "NEXUS") 
        Ownable(initialOwner) 
    {
        treasuryWallet = _treasury;
        liquidityWallet = _liquidity;
        
        isExcludedFromFees[initialOwner] = true;
        isExcludedFromFees[address(this)] = true;
        isExcludedFromFees[_treasury] = true;
        isExcludedFromFees[_liquidity] = true;

        _mint(initialOwner, MAX_SUPPLY);
    }

    function updateFees(uint256 _buyFee, uint256 _sellFee) external onlyOwner {
        require(_buyFee <= 1000 && _sellFee <= 1000, "Fees too high"); // Max 10%
        buyFee = _buyFee;
        sellFee = _sellFee;
        emit FeesUpdated(_buyFee, _sellFee);
    }

    function updateWallets(address _treasury, address _liquidity) external onlyOwner {
        treasuryWallet = _treasury;
        liquidityWallet = _liquidity;
        emit WalletsUpdated(_treasury, _liquidity);
    }

    function excludeFromFees(address account, bool excluded) external onlyOwner {
        isExcludedFromFees[account] = excluded;
    }

    // Override transfer to implement fees
    // Note: In a real production token, this logic needs to be very robust to avoid reentrancy or locking.
    // For this project, we'll implement a basic fee on transfer.
    function _update(address from, address to, uint256 amount) internal override {
        if (isExcludedFromFees[from] || isExcludedFromFees[to]) {
            super._update(from, to, amount);
            return;
        }

        uint256 fees = 0;
        
        // Buy (assuming from LP pair, but we don't know the pair address here easily without storage)
        // For simplicity in this demo, we'll just apply fee to all transfers not excluded
        // In a real adaptive system, we'd check if 'from' or 'to' is a registered AMM pair.
        
        fees = (amount * buyFee) / FEE_DENOMINATOR; // Simplified to flat fee for now
        
        if (fees > 0) {
            super._update(from, treasuryWallet, fees);
            amount -= fees;
        }

        super._update(from, to, amount);
        
        // Track volume (simplified)
        volumeStats[from] += amount;
        volumeStats[to] += amount;
    }
}
