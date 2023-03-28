// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "./RejectableNFT.sol";
import "./interfaces/IRejectableNFT.sol";
import "./interfaces/IExchangeableRNFT.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExchangeableRNFT is RejectableNFT, IExchangeableRNFT {
    
    using Counters for Counters.Counter;
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    Counters.Counter private _tokenIdCounter;

    constructor (string memory name_, string memory symbol_)  RejectableNFT(name_, symbol_){ 
        _name = name_;
        _symbol = symbol_; 
        _tokenIdCounter.increment();
    }

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to transferable owner
    mapping(uint256 => address) private _transferableOwners;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    mapping(uint256 => address) private _applicantRecipient;

    uint256 private deadline;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 _deadline
    ) public virtual {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId1),
            "ERC721: transfer caller is not owner nor approved"
        );

        _transfer(from, to, tokenId1, tokenId2, _deadline);
    }

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
    function _transfer(
        address from,
        address to,
        uint256 tokenId1, 
        uint256 tokenId2,
        uint256 _deadline
    ) internal  {
        require(
            RejectableNFT.ownerOf(tokenId1) == from,
            "ERC721: transfer from incorrect owner"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId1);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId1);

        _transferableOwners[tokenId1] = to;

        if(tokenId2 != 0){
            _applicantRecipient[tokenId2] = from;
        }

        deadline = _deadline;

        emit TransferRequest(from, to, tokenId1, tokenId2, deadline);
        /* _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId); */

        _afterTokenTransfer(from, to, tokenId1);
    }

    function acceptTransfer(uint256 tokenId1, uint256 tokenId2) public {
        require(
            _transferableOwners[tokenId1] == _msgSender(),
            "RejectableNFT: accept transfer caller is not the receiver of the token"
        );
        require(block.timestamp < deadline, "Deadline expired");

        address from = RejectableNFT.ownerOf(tokenId1);
        address to = _msgSender();

        if (from != address(0)) {
            // Perhaps previous owner is address(0), when minting
            _balances[from] -= 1;
        } 
        _balances[to] += 1;
        _owners[tokenId1] = to;

        // remove the transferable owner from the mapping
        _transferableOwners[tokenId1] = address(0);
        
        emit AcceptTransfer(from, to, tokenId1, tokenId2);

        if(tokenId2 != 0){
            _beforeTokenTransfer(to, from, tokenId2);
            require(RejectableNFT.ownerOf(tokenId2) == to, "ERC721: transfer from incorrect owner");

            delete _tokenApprovals[tokenId2];

            unchecked{
                _balances[to] -= 1;
                _balances[from] += 1;
            }

            _owners[tokenId2] = from;

            _afterTokenTransfer(to, from, tokenId2);
        }
    }

    function rejectTransfer(uint256 tokenId1, uint256 tokenId2) public {
        require(
            _transferableOwners[tokenId1] == _msgSender(),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );
        require(
            _applicantRecipient[tokenId2] == RejectableNFT.ownerOf(tokenId1),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );
        require(block.timestamp < deadline, "Deadline expired");

        address from = RejectableNFT.ownerOf(tokenId1);
        address to = _msgSender();

        _transferableOwners[tokenId1] = address(0);
        _applicantRecipient[tokenId2] = address(0);


        emit RejectTransfer(from, to, tokenId1, tokenId2);
    }

}