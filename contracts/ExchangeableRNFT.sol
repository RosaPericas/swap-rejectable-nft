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

    struct proposal{
        address from;
        address to;
        uint256 tokenId1;
        uint256 tokenId2;
        uint256 deadline;
        bool opened;
    }

    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to token count
    mapping(address => uint256) private _balances;

    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;

    // Mapping from token ID to transferable owner
    mapping(uint256 => address) private _transferableOwners;

    mapping(uint256 => proposal) public swapProp;

    /**
     * @dev See {IERC721-ownerOf}.
     */
    function ownerOf(uint256 tokenId) public view virtual override(RejectableNFT, IERC721) returns (address) {
        address owner = _owners[tokenId];
        return owner;
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner)
        public
        view
        virtual
        override (RejectableNFT, IERC721)
        returns (uint256)
    {
        require(
            owner != address(0),
            "ERNFT: balance query for the zero address"
        );
        return _balances[owner];
    }

    function safeMint(address _to) public override onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _mint(_to, tokenId);
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
        require(to != address(0), "ERNFT: mint to the zero address");
        require(!_exists(tokenId), "ERNFT: token already minted");

        _transferableOwners[tokenId] = to;

        emit TransferRequest(address(0), to, tokenId);
    }
    
    /**
     * @dev See {IERC721-approve}.
     */
    function approve(address to, uint256 tokenId) public virtual override(ERC721, IERC721) {
        address owner = ExchangeableRNFT.ownerOf(tokenId);
        require(to != owner, "ERNFT: approval to current owner");

        require(
            _msgSender() == owner || isApprovedForAll(owner, _msgSender()),
            "ERNFT: approve caller is not token owner or approved for all"
        );

        require( !swapProp[tokenId].opened, "TokenId has a swap proposal opened" );

        _approve(to, tokenId);
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
     * @dev See {IERC721-getApproved}.
     */
    function getApproved(uint256 tokenId) public view virtual override(ERC721, IERC721) returns (address) {
        require(ExchangeableRNFT.ownerOf(tokenId) != address(0), "ERNFT: invalid token ID");

        return _tokenApprovals[tokenId];
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
        override (RejectableNFT, IRejectableNFT)
        returns (address)
    {
        address owner = _transferableOwners[tokenId];

        return owner;
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
            "ERNFT: transfer from incorrect owner"
        );
        require(to != address(0), "ERNFT: transfer to the zero address");


        // Clear approvals from the previous owner
        _approve(address(0), tokenId);

        _transferableOwners[tokenId] = to;

        emit TransferRequest(from, to, tokenId);
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
            from != address(0) && ExchangeableRNFT.ownerOf(tokenId1) == from,
            "ERNFT: transfer from incorrect owner"
        );
        require(
            to != address(0) && ExchangeableRNFT.ownerOf(tokenId2) == to,
            "ERNFT: transfer to incorrect owner"
        );
        require(deadline > block.timestamp, "Incorrect deadline");


        // Clear approvals from the previous owner
        _approve(address(0), tokenId1);

        proposal memory newProposal;

        newProposal.tokenId1 = tokenId1;
        newProposal.tokenId2 = tokenId2;
        newProposal.from = from;
        newProposal.to = to;
        newProposal.deadline = deadline;
        newProposal.opened = true;

        swapProp[tokenId1] = newProposal;
        swapProp[tokenId2] = newProposal;

        emit SwapRequest(from, to, tokenId1, tokenId2, deadline);
    }


    //RejectableNFT acceptransfer function
    function acceptTransfer(uint256 tokenId) public override (RejectableNFT, IRejectableNFT) {  
        require(
            _transferableOwners[tokenId] == _msgSender() || _isApprovedOrOwner(_msgSender(), tokenId),
            "ERNFT: accept transfer caller is not the receiver nor approved of the token"
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
        require(swapProp[tokenId1].opened && swapProp[tokenId2].opened, "ERNFT: Any swap proposal for the provided tokens currently open");
        
        require(
            _isApprovedOrOwner(_msgSender(), tokenId2),
            "ERNFT: the caller is neither the receiver nor approved for the token"
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
        ), "ERNFT: Different swapProp properties");

        require(block.timestamp < swapProp[tokenId1].deadline, "ERNFT: Deadline expired");

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

    function rejectTransfer(uint256 tokenId) public override(RejectableNFT, IRejectableNFT) {
        require(
            _transferableOwners[tokenId] == _msgSender() || _isApprovedOrOwner(_msgSender(), tokenId),
            "ERNFT: reject transfer caller is not the receiver nor approved of the token"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId);
        address to = _msgSender();

        _transferableOwners[tokenId] = address(0);

        emit RejectTransfer(from, to, tokenId);
    }
    
    function cancelTransfer(uint256 tokenId) public override (RejectableNFT, IRejectableNFT) {
        //solhint-disable-next-line max-line-length
        require(
            // perhaps previous owner is address(0), when minting
            (ExchangeableRNFT.ownerOf(tokenId) == address(0) &&
                owner() == _msgSender()) ||
                _isApprovedOrOwner(_msgSender(), tokenId),
            "ERNFT: transfer caller is not owner nor approved"
        );

        address from = ExchangeableRNFT.ownerOf(tokenId);
        address to = _transferableOwners[tokenId];

        _transferableOwners[tokenId] = address(0);

        emit CancelTransfer(from, to, tokenId);
    }

    function cancelSwap(uint256 tokenId1, uint256 tokenId2) public {
        require(swapProp[tokenId1].opened && swapProp[tokenId2].opened, "Any swap proposal for the provided tokens currently open");
        
        require(
            _isApprovedOrOwner(_msgSender(), tokenId1) || _isApprovedOrOwner(_msgSender(), tokenId2),
            "ERNFT: reject transfer caller is not the receiver nor approved of the token"
        );

        address from = swapProp[tokenId1].from;
        address to = swapProp[tokenId2].to;

        delete swapProp[tokenId1];
        delete swapProp[tokenId2];

        emit CancelSwap(from, to, tokenId1, tokenId2);
    }
}