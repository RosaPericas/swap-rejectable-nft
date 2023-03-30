// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title  Rejectable NFT interface
 * @dev Iterface that inherits from a Non-Fungible Token Standard, and it also adds
 * the possibility to be rejected by the receiver of the transfer function.
 */
interface IExchangeableRNFT {

    /**
     * @dev Emitted when `tokenId` token is proposed to be transferred from `from` sender to `to` receiver.
     */
    event SwapRequest(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2,
        uint256 deadline
    );

    /**
     * @dev Emitted when receiver `to` rejects `tokenId` transfer from `from` to `to`.
     */
    event RejectSwap(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

     /**
     * @dev Emitted when sender `from` accepts `tokenId` transfer from `from` to `to`.
     */
    event AcceptSwap(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

    /**
     * @dev Emitted when receiver `to` rejects `tokenId` transfer from `from` to `to`.
     */
    event RejectTransfer(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

    /**
     * @dev Emitted when receiver `to` rejects `tokenId` transfer from `from` to `to`.
     */
    event CancelSwap(
        address indexed from,
        address indexed to,
        uint256 tokenId1,
        uint256 tokenId2
    );

     /**
     * @dev Accepts the transfer of the given token ID
     * The caller must be the current transferable owner of the token ID
     * @param tokenId1 ID of the token to be transferred
     * @param tokenId2 ID of the token to be transferred
     */
    function acceptSwap(uint256 tokenId1, uint256 tokenId2) external;

    function cancelSwap(uint256 tokenId1, uint256 tokenId2) external;
}