// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Counters.sol";

contract MonVote {
    using Counters for Counters.Counter;

    Counters.Counter private _proposalIds;

    struct Proposal {
        uint id;
        string title;
        string description;
        address proposer;
        uint upvotes;
        uint downvotes;
    }

    mapping(uint => Proposal) public proposals;
    mapping(uint => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint indexed id, string title, address indexed proposer);
    event Voted(uint indexed proposalId, address indexed voter, bool voteFor);

    function createProposal(string memory _title, string memory _description) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_title).length <= 100, "Title is too long");
        require(bytes(_description).length <= 300, "Description is too long");

        uint currentId = _proposalIds.current();
        proposals[currentId] = Proposal(
            currentId,
            _title,
            _description,
            msg.sender,
            0,
            0
        );
        emit ProposalCreated(currentId, _title, msg.sender);
        _proposalIds.increment();
    }

    function vote(uint _proposalId, bool _voteFor) public {
        require(_proposalId < _proposalIds.current(), "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted on this proposal");

        Proposal storage proposal = proposals[_proposalId];
        if (_voteFor) {
            proposal.upvotes++;
        } else {
            proposal.downvotes++;
        }

        hasVoted[_proposalId][msg.sender] = true;
        emit Voted(_proposalId, msg.sender, _voteFor);
    }

    function getProposal(uint _proposalId) public view returns (Proposal memory) {
        require(_proposalId < _proposalIds.current(), "Proposal does not exist");
        return proposals[_proposalId];
    }

    function getProposalCount() public view returns (uint) {
        return _proposalIds.current();
    }
}
