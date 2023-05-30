// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "./RejNFT.sol";
import "./interfaces/IRejNFT.sol";
import "./interfaces/IExNFT.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

contract ExNFT is RejNFT, IExNFT {

    struct proposal{
        address from;
        address to;
        uint256 tokenId1;
        uint256 tokenId2;
        uint256 deadline;
        bool opened;
    }

    mapping(uint256 => proposal) public swapProp;
    mapping(uint256 => bool) public newProposal;
    
    constructor (string memory name_, string memory symbol_)
        RejNFT(name_, symbol_) 
        { }

/* 
    function safeMint(address _to) public override onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(_to, tokenId);
    } */



    /**
     * @dev Transfers `tokenId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `tokenId` token must be owned by `from`.
     *
     * Emits a {TransferRequest} event.
     */
    function swapProposal(
        address from,
        address to,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 deadline
    ) public virtual {
        require(
            _isApprovedOrOwner(_msgSender(), tokenId1),
            "ExNFT: transfer caller is not owner nor approved"
        );

        require(!newProposal[tokenId1] && !newProposal[tokenId2], 
                "ExNFT: can't open swap proposal");
        require(
            from != address(0) && ownerOf(tokenId1) == from,
            "ExNFT: transfer from incorrect owner"
        );
        require(
            to != address(0) && ownerOf(tokenId2) == to,
            "ExNFT: transfer to incorrect owner"
        );
        require(deadline > block.timestamp, "Incorrect deadline");

        // Clear approvals from the previous owner
        _approve(address(0), tokenId1);

        swapProp[tokenId1] = proposal(from, to, tokenId1, tokenId2, deadline, true);
        newProposal[tokenId1] = true;
        newProposal[tokenId2] = true;

        emit SwapRequest(from, to, tokenId1, tokenId2, deadline);
    }


    function acceptSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(newProposal[tokenId1] && newProposal[tokenId2], "ExNFT: Any swap proposal for the provided tokens currently open");
        
        require(
            _isApprovedOrOwner(_msgSender(), tokenId2) && swapProp[tokenId1].tokenId2 == tokenId2,
            "ExNFT: the caller is neither the receiver nor approved for the token"
        );

        require(block.timestamp < swapProp[tokenId1].deadline, "ExNFT: Deadline expired");

        address from = swapProp[tokenId1].from;
        address to = swapProp[tokenId1].to;

        _owners[tokenId1] = to; 

        // Clear approvals from the previous owner
        _approve(address(0), tokenId2);
        
        _owners[tokenId2] = from;
        
        delete swapProp[tokenId1];
        newProposal[tokenId1] = false;
        newProposal[tokenId2] = false;

        emit AcceptSwap(from, to, tokenId1, tokenId2);
    }

    function cancelSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(newProposal[tokenId1] && newProposal[tokenId2], "ExNFT: Any swap proposal for the provided tokens currently open");
        
        require(
            (_isApprovedOrOwner(_msgSender(), tokenId1) || _isApprovedOrOwner(_msgSender(), tokenId2)) && 
            swapProp[tokenId1].tokenId1 == tokenId1 &&  swapProp[tokenId1].tokenId2 == tokenId2,
            "ExNFT: reject transfer caller is not the receiver nor approved of the token"
        );

        address from = swapProp[tokenId1].from;
        address to = swapProp[tokenId1].to;

        delete swapProp[tokenId1];
        newProposal[tokenId1] = false;
        newProposal[tokenId2] = false;

        emit CancelSwap(from, to, tokenId1, tokenId2);
    }
}