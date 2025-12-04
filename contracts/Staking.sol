// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Nexus Trade Staking Contract
/// @author Nexus Trade Team - variable.k
/// @notice Allows users to stake tokens and earn rewards, with boosts for NFT holders
/// @dev Implements time-locked staking with dynamic reward calculations
contract Staking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;
    IERC721 public accessNFT;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockPeriod; // in seconds
        bool active;
    }

    mapping(address => StakeInfo[]) public userStakes;

    event Staked(address indexed user, uint256 amount, uint256 lockPeriod);
    event Withdrawn(address indexed user, uint256 amount, uint256 reward);

    /// @notice Initializes the staking contract
    /// @param _stakingToken The ERC20 token to be staked
    /// @param _accessNFT The ERC721 contract for access/boost NFTs
    constructor(address _stakingToken, address _accessNFT) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        accessNFT = IERC721(_accessNFT);
    }

    /// @notice Stakes tokens for a specified lock period
    /// @param _amount The amount of tokens to stake
    /// @param _lockPeriod The duration to lock the tokens (in seconds)
    function stake(uint256 _amount, uint256 _lockPeriod) external nonReentrant {
        require(_amount > 0, "Cannot stake 0");
        stakingToken.transferFrom(msg.sender, address(this), _amount);

        userStakes[msg.sender]
        .push(StakeInfo({amount: _amount, startTime: block.timestamp, lockPeriod: _lockPeriod, active: true}));

        emit Staked(msg.sender, _amount, _lockPeriod);
    }

    /// @notice Withdraws staked tokens and rewards
    /// @param _stakeIndex The index of the stake in the user's stake array
    function withdraw(uint256 _stakeIndex) external nonReentrant {
        require(_stakeIndex < userStakes[msg.sender].length, "Invalid index");
        StakeInfo storage userStake = userStakes[msg.sender][_stakeIndex];

        require(userStake.active, "Already withdrawn");
        require(block.timestamp >= userStake.startTime + userStake.lockPeriod, "Stake is locked");

        uint256 amount = userStake.amount;
        uint256 reward = calculateReward(msg.sender, amount, userStake.lockPeriod);

        userStake.active = false;

        // Transfer principal + reward
        // Note: Contract must be funded with rewards
        uint256 contractBalance = stakingToken.balanceOf(address(this));
        if (contractBalance >= amount + reward) {
            stakingToken.transfer(msg.sender, amount + reward);
        } else {
            // Fallback: just return principal if rewards run out
            stakingToken.transfer(msg.sender, amount);
        }

        emit Withdrawn(msg.sender, amount, reward);
    }

    /// @notice Calculates the reward for a stake
    /// @param _user The address of the user
    /// @param _amount The amount staked
    /// @param _lockPeriod The duration of the lock
    /// @return The calculated reward amount
    function calculateReward(address _user, uint256 _amount, uint256 _lockPeriod) public view returns (uint256) {
        // Simple reward logic: 10% APY equivalent
        // reward = amount * 0.10 * (lockPeriod / 365 days)
        uint256 baseReward = (_amount * 10 * _lockPeriod) / (100 * 365 days);

        // Apply 2x boost if user holds Access NFT
        if (address(accessNFT) != address(0) && accessNFT.balanceOf(_user) > 0) {
            return baseReward * 2;
        }

        return baseReward;
    }

    /// @notice Returns all stakes for a user
    /// @param _user The address of the user
    /// @return An array of StakeInfo structs
    function getUserStakes(address _user) external view returns (StakeInfo[] memory) {
        return userStakes[_user];
    }

    /// @notice Updates the Access NFT contract address
    /// @param _accessNFT The new Access NFT contract address
    function setAccessNFT(address _accessNFT) external onlyOwner {
        accessNFT = IERC721(_accessNFT);
    }
}
