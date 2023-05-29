// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title  Rejectable NFT interface
 * @dev Iterface that inherits from a Non-Fungible Token Standard, and it also adds
 * the possibility to be rejected by the receiver of the transfer function.
 */
interface IRejNFT is IERC721 {
    /**
     * @dev Emitted when `tokenId` token is proposed to be transferred from `from` sender to `to` receiver.
     */
    event TransferRequest(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when receiver `to` rejects `tokenId` transfer from `from` to `to`.
     */
    event RejectTransfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @dev Emitted when sender `from` cancels `tokenId` transfer from `from` to `to`.
     */
    event CancelTransfer(
        address indexed from,
        address indexed to,
        uint256 indexed tokenId
    );

    /**
     * @dev Returns the address of the tokenId token to which it is currently offered.
     * @param tokenId ID of the token to query the offer of
     * @return Address currently marked as the next possible owner of the given token ID
     */
    function transferableOwnerOf(uint256 tokenId)
        external
        view
        returns (address);
    
    /**
     * @dev Accepts the transfer of the given token ID
     * The caller must be the current transferable owner of the token ID
     * @param tokenId ID of the token to be transferred
     */
    function acceptTransfer(uint256 tokenId) external;

    /**
     * @dev Rejects the transfer of the given token ID
     * The caller must be the current transferable owner of the token ID
     * @param tokenId ID of the token to be transferred
     */
    function rejectTransfer(uint256 tokenId) external;

    /**
     * @dev Cancels the transfer of the given token ID
     * The caller must be the current owner of the token ID
     * @param tokenId ID of the token to be transferred
     */
    function cancelTransfer(uint256 tokenId) external;
}
