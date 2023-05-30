// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "./IRejNFT.sol";

/**
 * @title  Exchangeable Rejectable NFT interface
 * @dev Iterface that inherits from the Rejectable NFT interface, and it also adds
 * the possibility to request, reject and accept a rejectable NFT swap.
 */
interface IExNFT is IRejNFT{

    /**
     * @dev Emitted when `tokenId1` for `tokenId2` swap is proposed from `from` sender to `to` receiver, with an specified `deadline`.
     */
    event SwapRequest(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 deadline
    );

     /**
     * @dev Emitted when sender `from` accepts `tokenId1` for `tokenId2`swap from `from` to `to`.
     */
    event AcceptSwap(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

    /**
     * @dev Emitted when sender `from` cancels `tokenId1` for `tokenId2` swap from `from` to `to`.
     */
    event RejectOrCancelSwap(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

     /**
     * @dev Accepts the swap of `tokenId1` for `tokenId2` 
     * The caller must be the current transferable owner of the `tokenId2`
     * @param tokenId1 ID of the token to be received
     * @param tokenId2 ID of the token to be sent
     */
    function acceptSwap(uint256 tokenId1, uint256 tokenId2) external;
    
    /**
     * @dev Cancels the swap of `tokenId1` for `tokenId2` 
     * The caller must be the owner of `tokenId1`
     * @param tokenId1 ID of the token proposed to send
     * @param tokenId2 ID of the token proposed to receive
     */
    function rejectOrCancelSwap(uint256 tokenId1, uint256 tokenId2) external;
}