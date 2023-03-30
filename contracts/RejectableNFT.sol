// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./interfaces/IRejectableNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RejectableNFT is ERC721, IRejectableNFT, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;
    
    // Mapping from token ID to transferable owner
    mapping(uint256 => address) private _transferableOwners;

    /**
     * @dev Initializes the contract by setting a `name` and a `symbol` to the token collection.
     * overrides ERC721 constructor
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_)
    { }
    
    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override (ERC721, IERC721)
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERC721: balance query for the zero address"
        );
        return _balances[owner];
    }

    /**
     * @dev See {IERC721-ownerOf}.
     * Modified: for RejectableNFT owner can be addressZero
     */
    function ownerOf(uint256 tokenId) public view virtual override(ERC721, IERC721) returns (address) {
        address owner = _owners[tokenId];
        return owner;
    }

    /**
     * @dev Returns the owner of the `tokenId`. Does NOT revert if token doesn't exist
     */
    function _ownerOf(uint256 tokenId) internal view virtual override (ERC721) returns (address) {
        return _owners[tokenId];
    } 

    /**
     * @dev Returns whether `tokenId` exists.
     *
     * Tokens can be managed by their owner or approved accounts via {approve} or {setApprovalForAll}.
     *
     * Tokens start existing when they are minted (`_mint`),
     * and stop existing when they are burned (`_burn`).
     */
    function _exists(uint256 tokenId) internal view virtual override ( ERC721 ) returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId)
        internal
        view
        virtual
        override
        returns (bool)
    {
        require(
            _exists(tokenId),
            "ERC721: operator query for nonexistent token"
        );
        address owner = RejectableNFT.ownerOf(tokenId);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }
    
    /**
     * @dev Request the mint of `tokenId` and transfer it to `to`.
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

        _afterTokenTransfer(address(0), to, tokenId);
    }

    /**
     * @dev Request the transfer of `tokenId` from `from` to `to`.
     *  Adds `to`as a transferable owner of `tokenId`
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
    ) internal virtual override (ERC721) {
        require(
            RejectableNFT.ownerOf(tokenId) == from,
            "ERC721: transfer from incorrect owner"
        );
        require(to != address(0), "ERC721: transfer to the zero address");

        _beforeTokenTransfer(from, to, tokenId);

        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _transferableOwners[tokenId] = to;

        emit TransferRequest(from, to, tokenId);

        _afterTokenTransfer(from, to, tokenId);
    }

    //-------------------------------------------------------------------------------//
    //                                Added functions                                //
    //-------------------------------------------------------------------------------//

    /**
     * @dev Safely mints a new token and transfers it to `to`.
     * The new tokenId is consecutive with the last token minted. 
     */
    function safeMint(address _to) public virtual onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(_to, tokenId);
    }

    /**
     * @dev Returns the address of `tokenId` to which it is currently offered.
     *
     */
    function transferableOwnerOf(uint256 tokenId)
        public
        view
        virtual
        override
        returns (address)
    {
        address owner = _transferableOwners[tokenId];

        return owner;
    }

    /**
     * @dev `tokenId` transferableOwner accepts `tokenId`transfer.
     * The transfer of `tokenId`to the transferableOwner is executed.
     *
     * Requirements:
     *
     * - `_msgSender` must be the `tokenId` transferable Owner.
     *
     * Emits a {Transfer} event.
     */
    function acceptTransfer(uint256 tokenId) public virtual override {
        require(
            _transferableOwners[tokenId] == _msgSender(),
            "RejectableNFT: accept transfer caller is not the receiver of the token"
        );

        address from = RejectableNFT.ownerOf(tokenId);
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

    /**
     * @dev `tokenId` transferableOwner rejects `tokenId` transfer.
     * The `tokenId`transferableOwner is set to addressZero.
     *
     * Requirements:
     *
     * - `_msgSender` must be the `tokenId` transferable Owner.
     *
     * Emits a {RejectTransfer} event.
     */
    function rejectTransfer(uint256 tokenId) public virtual override {
        require(
            _transferableOwners[tokenId] == _msgSender(),
            "RejectableNFT: reject transfer caller is not the receiver of the token"
        );

        address from = RejectableNFT.ownerOf(tokenId);
        address to = _msgSender();

        _transferableOwners[tokenId] = address(0);

        emit RejectTransfer(from, to, tokenId);
    }

    /**
     * @dev `tokenId` owner cencels a `tokenId` transfer request.
     * The `tokenId`transferableOwner is set to addressZero.
     *
     * Requirements:
     *
     * - `tokenId` can be non minted: `tokenId` must be addressZero and `_msgSender` must be the RejectableNFT smart contract owner.
     * - ``_msgSender must have `tokenId` approval or must be `tokenId` owner
     *
     * Emits a {CancelTransfer} event.
     */
    function cancelTransfer(uint256 tokenId) public virtual override {
        //solhint-disable-next-line max-line-length
        require(
            // perhaps previous owner is address(0), when minting
            (RejectableNFT.ownerOf(tokenId) == address(0) &&
                owner() == _msgSender()) ||
                _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721: transfer caller is not owner nor approved"
        );

        address from = RejectableNFT.ownerOf(tokenId);
        address to = _transferableOwners[tokenId];

        require(to != address(0), "RejectableNFT: token is not transferable");
        _transferableOwners[tokenId] = address(0);

        emit CancelTransfer(from, to, tokenId);
    }


    /**
     * @dev Hook that is called before any token transfer. This includes minting and burning. If {ERC721Consecutive} is
     * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s tokens will be transferred to `to`.
     * - When `from` is zero, the tokens will be minted for `to`.
     * - When `to` is zero, ``from``'s tokens will be burned.
     * - `from` and `to` are never both zero.
     * - `batchSize` is non-zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId
    ) internal virtual {}

    /**
     * @dev Hook that is called after any token transfer. This includes minting and burning. If {ERC721Consecutive} is
     * used, the hook may be called as part of a consecutive (batch) mint, as indicated by `batchSize` greater than 1.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s tokens were transferred to `to`.
     * - When `from` is zero, the tokens were minted for `to`.
     * - When `to` is zero, ``from``'s tokens were burned.
     * - `from` and `to` are never both zero.
     * - `batchSize` is non-zero.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId
    ) internal virtual {}

}