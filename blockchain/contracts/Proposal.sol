// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract Proposal is ERC721URIStorage {
    uint256 public proposalCount;
    mapping(uint256 => ProposalDetails) public proposals;

    struct ProposalDetails {
        address proposer;
        address receiver;
        bool accepted;
        string nftURI; // URL for the NFT certificate
    }

    event ProposalMade(uint256 proposalId, address indexed proposer, address indexed receiver);
    event ProposalAccepted(uint256 proposalId, address indexed receiver);

    constructor() ERC721("ProposalNFT", "PNFT") {}

    // Function to make a proposal
    function makeProposal(address _receiver, string memory _nftURI) external {
        uint256 proposalId = proposalCount++;
        proposals[proposalId] = ProposalDetails({
            proposer: msg.sender,
            receiver: _receiver,
            accepted: false,
            nftURI: _nftURI
        });

        emit ProposalMade(proposalId, msg.sender, _receiver);
    }

    // Function to accept the proposal
    function acceptProposal(uint256 proposalId) external {
        ProposalDetails storage proposal = proposals[proposalId];

        // Ensure the caller is the receiver
        require(msg.sender == proposal.receiver, "Only the receiver can accept the proposal");

        // Mark the proposal as accepted
        require(!proposal.accepted, "Proposal already accepted");
        proposal.accepted = true;

        // Mint an NFT as a certificate upon acceptance
        uint256 newTokenId = proposalId; // Use proposalId as the tokenId for uniqueness
        _mint(proposal.receiver, newTokenId);
        _setTokenURI(newTokenId, proposal.nftURI); // Set the token URI (certificate URL)

        emit ProposalAccepted(proposalId, msg.sender);
    }
}
