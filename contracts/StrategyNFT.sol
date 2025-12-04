// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Strategy NFT
/// @author Nexus Trade Team - variable.k
/// @notice Represents ownership of a unique trading strategy
/// @dev ERC721 token where each token corresponds to a specific strategy configuration
contract StrategyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    struct StrategyMetadata {
        string name;
        string description;
        uint256 riskLevel; // 1-5
        address creator;
    }

    mapping(uint256 => StrategyMetadata) public strategies;

    event StrategyMinted(uint256 indexed tokenId, address indexed creator, string name);

    /// @notice Initializes the Strategy NFT contract
    constructor() ERC721("Nexus Strategy", "NXS") Ownable(msg.sender) {}

    /// @notice Mints a new Strategy NFT
    /// @param to The recipient of the NFT
    /// @param name The name of the strategy
    /// @param description A description of the strategy
    /// @param riskLevel The risk level (1-5)
    /// @return The ID of the newly minted token
    function mintStrategy(address to, string memory name, string memory description, uint256 riskLevel)
        external
        onlyOwner
        returns (uint256)
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        strategies[tokenId] =
            StrategyMetadata({name: name, description: description, riskLevel: riskLevel, creator: to});

        emit StrategyMinted(tokenId, to, name);
        return tokenId;
    }

    /// @notice Returns the metadata for a given strategy
    /// @param tokenId The ID of the token
    /// @return The StrategyMetadata struct
    function getStrategy(uint256 tokenId) external view returns (StrategyMetadata memory) {
        return strategies[tokenId];
    }
}
