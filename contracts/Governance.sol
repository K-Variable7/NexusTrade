// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

/// @title Nexus Governance
/// @author Nexus Trade Team - variable.k
/// @notice Governance contract for the Nexus Trade ecosystem
/// @dev Implements OpenZeppelin Governor for on-chain voting
contract Governance is Governor, GovernorSettings, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    /// @notice Initializes the Governance contract
    /// @param _token The voting token address
    constructor(IVotes _token)
        Governor("NexusGovernance")
        GovernorSettings(1 days, 1 weeks, 100e18) // Delay, Period, Threshold
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4% Quorum

    {}

    // The following functions are overrides required by Solidity.

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
}
