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
            "ERNFT: transfer caller is not owner nor approved"
        );

        require(swapProp[tokenId1].opened == false && swapProp[tokenId2].opened == false, 
                "ERNFT: can't open swap proposal");
        require(
            from != address(0) && ownerOf(tokenId1) == from,
            "ERNFT: transfer from incorrect owner"
        );
        require(
            to != address(0) && ownerOf(tokenId2) == to,
            "ERNFT: transfer to incorrect owner"
        );
        require(deadline > block.timestamp, "Incorrect deadline");


        // Clear approvals from the previous owner
        _approve(address(0), tokenId1);

        swapProp[tokenId1] = proposal(from, to, tokenId1, tokenId2, deadline, true);
        swapProp[tokenId2] = proposal(from, to, tokenId1, tokenId2, deadline, true);

        emit SwapRequest(from, to, tokenId1, tokenId2, deadline);
    }


    function acceptSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(swapProp[tokenId1].opened && swapProp[tokenId2].opened, "ExNFT: Any swap proposal for the provided tokens currently open");
        
        require(
            _isApprovedOrOwner(_msgSender(), tokenId2),
            "ExNFT: the caller is neither the receiver nor approved for the token"
        );

        require(
        keccak256(abi.encode(
            swapProp[tokenId1].tokenId1, 
            swapProp[tokenId1].tokenId2, 
            swapProp[tokenId1].from, 
            swapProp[tokenId1].to, 
            swapProp[tokenId1].deadline, 
            swapProp[tokenId1].opened
        )) == keccak256(abi.encode(
            swapProp[tokenId2].tokenId1, 
            swapProp[tokenId2].tokenId2, 
            swapProp[tokenId2].from, 
            swapProp[tokenId2].to, 
            swapProp[tokenId2].deadline, 
            swapProp[tokenId2].opened)
        ), "ExNFT: Different swapProp properties");

        require(block.timestamp < swapProp[tokenId1].deadline, "ExNFT: Deadline expired");

        address from = swapProp[tokenId1].from;
        address to = swapProp[tokenId2].to;

        _owners[tokenId1] = to; 

        // Clear approvals from the previous owner
        _approve(address(0), tokenId2);
        
        _owners[tokenId2] = from;
        
        delete swapProp[tokenId1];
        delete swapProp[tokenId2];

        emit AcceptSwap(from, to, tokenId1, tokenId2);
    }

    function cancelSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(swapProp[tokenId1].opened && swapProp[tokenId2].opened, "Any swap proposal for the provided tokens currently open");
        
        require(
            _isApprovedOrOwner(_msgSender(), tokenId1) || _isApprovedOrOwner(_msgSender(), tokenId2),
            "ExNFT: reject transfer caller is not the receiver nor approved of the token"
        );

        address from = swapProp[tokenId1].from;
        address to = swapProp[tokenId2].to;

        delete swapProp[tokenId1];
        delete swapProp[tokenId2];

        emit CancelSwap(from, to, tokenId1, tokenId2);
    }
}