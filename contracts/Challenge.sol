// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Nexus Trade Challenge Contract
/// @author Nexus Trade Team - variable.k
/// @notice Manages trading challenges and competitions
/// @dev Implements challenge creation, participation, scoring, and reward distribution
contract Challenge is Ownable, ReentrancyGuard {
    IERC20 public rewardToken;

    struct ChallengeInfo {
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 rewardPool;
        uint256 participantCount;
        bool isActive;
    }

    struct Participant {
        bool hasJoined;
        uint256 score;
        bool hasClaimed;
    }

    mapping(uint256 => ChallengeInfo) public challenges;
    mapping(uint256 => mapping(address => Participant)) public participants;
    uint256 public challengeCount;

    event ChallengeCreated(uint256 indexed challengeId, string name, uint256 endTime);
    event UserJoined(uint256 indexed challengeId, address indexed user);
    event ScoreSubmitted(uint256 indexed challengeId, address indexed user, uint256 score);
    event RewardClaimed(uint256 indexed challengeId, address indexed user, uint256 amount);

    /// @notice Initializes the challenge contract
    /// @param _rewardToken The token used for rewards
    constructor(address _rewardToken) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
    }

    /// @notice Creates a new challenge
    /// @param _name The name of the challenge
    /// @param _description A description of the challenge
    /// @param _duration The duration of the challenge in seconds
    /// @param _rewardAmount The total reward pool amount
    function createChallenge(string memory _name, string memory _description, uint256 _duration, uint256 _rewardAmount)
        external
        onlyOwner
    {
        require(rewardToken.transferFrom(msg.sender, address(this), _rewardAmount), "Transfer failed");

        challengeCount++;
        challenges[challengeCount] = ChallengeInfo({
            name: _name,
            description: _description,
            startTime: block.timestamp,
            endTime: block.timestamp + _duration,
            rewardPool: _rewardAmount,
            participantCount: 0,
            isActive: true
        });

        emit ChallengeCreated(challengeCount, _name, block.timestamp + _duration);
    }

    /// @notice Allows a user to join a challenge
    /// @param _challengeId The ID of the challenge to join
    function joinChallenge(uint256 _challengeId) external {
        ChallengeInfo storage challenge = challenges[_challengeId];
        require(challenge.isActive, "Challenge not active");
        require(block.timestamp < challenge.endTime, "Challenge ended");
        require(!participants[_challengeId][msg.sender].hasJoined, "Already joined");

        participants[_challengeId][msg.sender].hasJoined = true;
        challenge.participantCount++;

        emit UserJoined(_challengeId, msg.sender);
    }

    /// @notice Submits a score for a participant
    /// @dev Currently restricted to owner (oracle/backend)
    /// @param _challengeId The ID of the challenge
    /// @param _score The score to submit
    function submitScore(uint256 _challengeId, uint256 _score) external onlyOwner {
        // In a real app, this might be called by an oracle or verified backend
        require(participants[_challengeId][msg.sender].hasJoined, "Not a participant");
        participants[_challengeId][msg.sender].score = _score;

        emit ScoreSubmitted(_challengeId, msg.sender, _score);
    }

    /// @notice Claims rewards after challenge completion
    /// @dev Simplified distribution logic
    /// @param _challengeId The ID of the challenge
    function claimReward(uint256 _challengeId) external nonReentrant {
        ChallengeInfo storage challenge = challenges[_challengeId];
        Participant storage participant = participants[_challengeId][msg.sender];

        require(block.timestamp > challenge.endTime, "Challenge still active");
        require(participant.hasJoined, "Not a participant");
        require(!participant.hasClaimed, "Already claimed");

        // Simple winner takes all or equal distribution logic could go here
        // For now, just return a fixed amount or based on score
        uint256 reward = challenge.rewardPool / challenge.participantCount;

        participant.hasClaimed = true;
        rewardToken.transfer(msg.sender, reward);

        emit RewardClaimed(_challengeId, msg.sender, reward);
    }
}
