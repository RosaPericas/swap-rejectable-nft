// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "./RejectableNFT.sol";
import "./interfaces/IRejectableNFT.sol";
import "./interfaces/IExchangeableRNFT.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ExchangeableRNFT is RejectableNFT, IExchangeableRNFT {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    // Token name
    string private _name;

    // Token symbol
    string private _symbol;

    constructor (string memory name_, string memory symbol_)  RejectableNFT(name_, symbol_) {
        _name = name_;
        _symbol = symbol_; 
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

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override(RejectableNFT) returns (address) {
        address owner = _owners[tokenId];
        //require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }

    function safeMint(address _to) public override onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to, tokenId);
    }
    /**
     * @dev Mints `tokenId` and transfers it to `to`.
     *
     * WARNING: Usage of this method is discouraged, use {_safeMint} whenever possible
     *
     * Requirements:
     *
     * - `tokenId` must not exist.
     * - `to` cannot be the zero address.
     *
     * Emits a {TransferRequest} event.
     */
    function _mint(address to, uint256 tokenId) internal virtual override{
        require(to != address(0), "ERC721: mint to the zero address");
        require(!_exists(tokenId), "ERC721: token already minted");

        _beforeTokenTransfer(address(0), to, tokenId);

        _transferableOwners[tokenId] = to;

        emit TransferRequest(address(0), to, tokenId);
        /* _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId); */

        _afterTokenTransfer(address(0), to, tokenId);
    }

    /**
     * @dev Approve `to` to operate on `tokenId`
     *
     * Emits an {Approval} event.
     */
    function _approve(address to, uint256 tokenId) internal virtual override(ERC721) {
        _tokenApprovals[tokenId] = to;
        emit Approval(ExchangeableRNFT.ownerOf(tokenId), to, tokenId);
    }
    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual override(RejectableNFT) returns (bool) {
        address owner = ExchangeableRNFT.ownerOf(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    function transferableOwnerOf(uint256 tokenId)
        public
        view
        virtual
        override (RejectableNFT)
        returns (address)
    {
        address owner = _transferableOwners[tokenId];

        return owner;
    }

    function applicantRecipient(uint256 tokenId)
        public
        view
        virtual
        returns (address)
    {
        address recipient = _applicantRecipient[tokenId];

        return recipient;
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
        uint256 tokenId
    ) internal virtual override (RejectableNFT) {
        require(
            ExchangeableRNFT.ownerOf(tokenId) == from,
            "ERC721: transfer from incorrect owner"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _transferableOwners[tokenId] = to;

        emit TransferRequest(from, to, tokenId);
        /* _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId); */

        _afterTokenTransfer(from, to, tokenId);
    }

    function swapProposal(
        address from,
        address to,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 _deadline
    ) public virtual {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId1),
            "ERNFT: transfer caller is not owner nor approved"
        );

        _swap(from, to, tokenId1, tokenId2, _deadline);
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
    function _swap(
        address from,
        address to,
        uint256 tokenId1, 
        uint256 tokenId2,
        uint256 _deadline
    ) internal  {
        require(
            ExchangeableRNFT.ownerOf(tokenId1) == from,
            "ERC721: transfer from incorrect owner"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId1);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId1);

        _transferableOwners[tokenId1] = to;

        //if(tokenId2 != 0){
            _applicantRecipient[tokenId2] = from;
        //}

        deadline = _deadline;

        emit SwapRequest(from, to, tokenId1, tokenId2, deadline);
        /* _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId); */

        _afterTokenTransfer(from, to, tokenId1);
    }

    //RejectableNFT acceptransfer function
    function acceptTransfer(uint256 tokenId) public override (RejectableNFT) {  
        require(
            _transferableOwners[tokenId] == _msgSender(),
            "RejectableNFT: accept transfer caller is not the receiver of the token"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId);
        address to = _msgSender();

        if (from != address(0)) {
            // Perhaps previous owner is address(0), when minting
            _balances[from] -= 1;
        }
        _balances[to] += 1;
        _owners[tokenId] = to;

        // remove the transferable owner from the mapping
        _transferableOwners[tokenId] = address(0);

        emit Transfer(from, to, tokenId);
    }

    function acceptSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(
            _transferableOwners[tokenId1] == _msgSender(),
            "RejectableNFT: accept transfer caller is not the receiver of the token"
        );
        require(block.timestamp < deadline, "Deadline expired");

        address from = ExchangeableRNFT.ownerOf(tokenId1);
        address to = _msgSender();

        //if (from != address(0)) {
            // Perhaps previous owner is address(0), when minting
            _balances[from] -= 1;
       // } 
        _balances[to] += 1;
        _owners[tokenId1] = to; 

        // remove the transferable owner from the mapping
        _transferableOwners[tokenId1] = address(0);
        
        emit AcceptSwap(from, to, tokenId1, tokenId2);

        //if(tokenId2 != 0){
           // _beforeTokenTransfer(to, from, tokenId2);
            require(ExchangeableRNFT.ownerOf(tokenId2) == to, "ERC721: transfer from incorrect owner");

            // Clear approvals from the previous owner
            _approve(address(0), tokenId2);

            // unchecked{
                _balances[to] -= 1;
                _balances[from] += 1;
           // } */

            _owners[tokenId2] = from;

           // _afterTokenTransfer(to, from, tokenId2);
        //}
    }

    function rejectTransfer(uint256 tokenId) public override {
        require(
            _transferableOwners[tokenId] == _msgSender(),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId);
        address to = _msgSender();

        _transferableOwners[tokenId] = address(0);

        emit RejectTransfer(from, to, tokenId);
    }

    function rejectSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(
            _transferableOwners[tokenId1] == _msgSender(),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );
        require(
            _applicantRecipient[tokenId2] == ExchangeableRNFT.ownerOf(tokenId1),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );
        require(block.timestamp < deadline, "Deadline expired");

        address from = ExchangeableRNFT.ownerOf(tokenId1);
        address to = _msgSender();

        _transferableOwners[tokenId1] = address(0);
        _applicantRecipient[tokenId2] = address(0);


        emit RejectSwap(from, to, tokenId1, tokenId2);
    }
    
    function cancelTransfer(uint256 tokenId) public override (RejectableNFT) {
        //solhint-disable-next-line max-line-length
        require(
            // perhaps previous owner is address(0), when minting
            (ExchangeableRNFT.ownerOf(tokenId) == address(0) &&
                owner() == _msgSender()) ||
                _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId);
        address to = _transferableOwners[tokenId];

        require(to != address(0), "RejectableNFT: token is not transferable");
        _transferableOwners[tokenId] = address(0);

        emit CancelTransfer(from, to, tokenId);
    }
    function cancelSwap(uint256 tokenId1, uint256 tokenId2) public {
        //solhint-disable-next-line max-line-length
        require(
            // perhaps previous owner is address(0), when minting
            (ExchangeableRNFT.ownerOf(tokenId1) == address(0) &&
                owner() == _msgSender()) ||
                _isApprovedOrOwner(_msgSender(), tokenId1),
            "ERC721: transfer caller is not owner nor approved"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId1);
        address to = _transferableOwners[tokenId1];

        require(to != address(0), "ERNFT: token is not transferable");
        _transferableOwners[tokenId1] = address(0);
        _applicantRecipient[tokenId2] = address(0);

        emit CancelSwap(from, to, tokenId1, tokenId2);
    }
}