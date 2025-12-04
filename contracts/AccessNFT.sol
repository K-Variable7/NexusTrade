// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Nexus Trade Genesis Access NFT
/// @author Nexus Trade Team - variable.k
/// @notice This contract manages the minting and metadata for the Nexus Trade Genesis Pass
/// @dev Implements ERC721 with on-chain SVG generation and whitelist functionality
contract AccessNFT is ERC721, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _nextTokenId;
    uint256 public constant MINT_PRICE = 0.1 ether;
    uint256 public constant MAX_SUPPLY = 1000;

    address public liquidityWallet;
    address public treasuryWallet;

    // Whitelist mapping
    mapping(address => bool) public whitelist;
    bool public whitelistActive = true;

    event Minted(address indexed to, uint256 tokenId);
    event WhitelistUpdated(address indexed user, bool status);

    /// @notice Initializes the contract with owner and wallet addresses
    /// @param initialOwner The address that will own the contract
    /// @param _liquidityWallet The address to receive liquidity funds (50%)
    /// @param _treasuryWallet The address to receive treasury funds (50%)
    constructor(address initialOwner, address _liquidityWallet, address _treasuryWallet)
        ERC721("Nexus Trade Genesis", "NXTGEN")
        Ownable(initialOwner)
    {
        liquidityWallet = _liquidityWallet;
        treasuryWallet = _treasuryWallet;
    }

    /// @notice Mints a new Genesis Pass NFT
    /// @dev Requires payment of MINT_PRICE. Checks whitelist if active. Splits funds 50/50.
    function mint() public payable nonReentrant {
        require(_nextTokenId < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent");

        if (whitelistActive) {
            require(whitelist[msg.sender], "Not whitelisted");
        }

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        // Split funds 50/50
        uint256 share = msg.value / 2;

        // Use call to prevent gas limit issues with transfers
        (bool success1,) = payable(liquidityWallet).call{value: share}("");
        require(success1, "Transfer to liquidity wallet failed");

        (bool success2,) = payable(treasuryWallet).call{value: address(this).balance}("");
        require(success2, "Transfer to treasury wallet failed");

        emit Minted(msg.sender, tokenId);
    }

    /// @notice Adds users to the whitelist
    /// @param users Array of addresses to whitelist
    function addToWhitelist(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = true;
            emit WhitelistUpdated(users[i], true);
        }
    }

    /// @notice Removes users from the whitelist
    /// @param users Array of addresses to remove from whitelist
    function removeFromWhitelist(address[] calldata users) external onlyOwner {
        for (uint256 i = 0; i < users.length; i++) {
            whitelist[users[i]] = false;
            emit WhitelistUpdated(users[i], false);
        }
    }

    /// @notice Toggles the whitelist requirement
    /// @param _active True to enable whitelist, false to disable
    function setWhitelistActive(bool _active) external onlyOwner {
        whitelistActive = _active;
    }

    /// @notice Returns the metadata URI for a given token ID
    /// @dev Generates on-chain SVG and returns base64 encoded JSON
    /// @param tokenId The ID of the token to query
    /// @return The token URI string
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "Nexus Genesis #',
                        tokenId.toString(),
                        '",',
                        '"description": "Nexus Trade Genesis Pass. Grants lifetime access to premium analytics, 2x staking rewards, and revenue share.",',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '",',
                        '"attributes": [',
                        '{"trait_type": "Tier", "value": "Genesis"},',
                        '{"trait_type": "Access Level", "value": "100"},',
                        '{"trait_type": "Type", "value": "Founder"}',
                        "]}"
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @notice Generates the SVG image for the NFT
    /// @param tokenId The ID of the token to generate SVG for
    /// @return The raw SVG string
    function generateSVG(uint256 tokenId) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">',
                "<defs>",
                // Rainbow Hologram Gradient
                '<linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:0.8" />',
                '<stop offset="16%" style="stop-color:#4ECDC4;stop-opacity:0.8" />',
                '<stop offset="33%" style="stop-color:#45B7D1;stop-opacity:0.8" />',
                '<stop offset="50%" style="stop-color:#96CEB4;stop-opacity:0.8" />',
                '<stop offset="66%" style="stop-color:#FFEAA7;stop-opacity:0.8" />',
                '<stop offset="83%" style="stop-color:#DDA0DD;stop-opacity:0.8" />',
                '<stop offset="100%" style="stop-color:#FF6B6B;stop-opacity:0.8" />',
                "</linearGradient>",
                // Shimmer Effect
                '<linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />',
                '<stop offset="50%" style="stop-color:rgba(255,255,255,0.8);stop-opacity:0.8" />',
                '<stop offset="100%" style="stop-color:rgba(255,255,255,0);stop-opacity:0" />',
                "</linearGradient>",
                // Metallic Effect
                '<linearGradient id="metallic" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#2b2b2b;stop-opacity:1" />',
                '<stop offset="30%" style="stop-color:#4a4a4a;stop-opacity:1" />',
                '<stop offset="70%" style="stop-color:#2b2b2b;stop-opacity:1" />',
                '<stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />',
                "</linearGradient>",
                // Glow Filter
                '<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
                "</defs>",
                // Main Card Body
                '<rect x="10" y="10" width="380" height="580" rx="20" fill="url(#metallic)" stroke="url(#rainbow)" stroke-width="4" />',
                // Holographic Overlay
                '<rect x="20" y="20" width="360" height="560" rx="15" fill="url(#rainbow)" opacity="0.15" />',
                '<rect x="20" y="20" width="360" height="560" rx="15" fill="url(#shimmer)" opacity="0.3" />',
                // Content
                '<text x="200" y="80" font-family="Arial" font-weight="bold" font-size="28" fill="url(#rainbow)" text-anchor="middle" filter="url(#glow)">NEXUS GENESIS</text>',
                // Center Icon/Logo Area
                '<circle cx="200" cy="250" r="80" fill="none" stroke="url(#rainbow)" stroke-width="2" opacity="0.5" />',
                '<circle cx="200" cy="250" r="70" fill="none" stroke="url(#rainbow)" stroke-width="1" opacity="0.3" />',
                '<text x="200" y="270" font-size="80" text-anchor="middle" fill="white">N</text>',
                // Token ID
                '<text x="200" y="400" font-family="Courier New" font-weight="bold" font-size="48" fill="white" text-anchor="middle" letter-spacing="4">#',
                tokenId.toString(),
                "</text>",
                // Footer Details
                '<rect x="50" y="450" width="300" height="2" fill="url(#rainbow)" opacity="0.5" />',
                '<text x="200" y="490" font-family="Arial" font-size="18" fill="#00BCD4" text-anchor="middle" letter-spacing="2">FOUNDER EDITION</text>',
                "</svg>"
            )
        );
    }
}
