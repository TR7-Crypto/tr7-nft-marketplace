// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    address payable public immutable feeAccount; // the account that receives fees
    uint256 public immutable feePercent; // the fee percentage on sales
    uint256 public itemCount;
    struct NFTItemVoucher {
        string owner;
        string nftTokenId;
        string status;
        string listedType;
        string price;
        string startingPrice;
        string endPrice;
        string duration;
        /// @notice the EIP-712 signature of all other fields in the NFTItemVoucher struct. For a voucher to be valid, it must be signed by an account with the MINTER_ROLE.
        bytes signature;
    }
    event Bought(
        address indexed nft,
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );
    // itemId -> Item
    mapping(uint256 => Item) public items;

    constructor(uint256 _feePercent) {
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function _hash(NFTItemVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "NFTItemVoucher(string owner,string nftTokenId,string status,string listedType,string price,string startingPrice,string endPrice,string duration)"
                        ),
                        keccak256(bytes(voucher.owner)),
                        keccak256(bytes(voucher.nftTokenId)),
                        keccak256(bytes(voucher.status)),
                        keccak256(bytes(voucher.listedType)),
                        keccak256(bytes(voucher.price)),
                        keccak256(bytes(voucher.startingPrice)),
                        keccak256(bytes(voucher.endPrice)),
                        keccak256(bytes(voucher.duration))
                    )
                )
            );
    }

    function _verify(NFTItemVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    function purchaseItem(address purchaser, NFTItemVoucher calldata voucher)
        external
        payable
        nonReentrant
    {
        // make sure signature is valid and get the address of the signer
        address payable signer = payable(_verify(voucher));

        Item storage item = Item(
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );
        uint256 _totalPrice = (item.price * (100 + feePercent)) / 100;
        require(
            msg.value >= _totalPrice,
            "not enough ETH to cover item price and market fee"
        );
        require(!item.sold, "item already sold");
        // pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        // transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);
        // emit bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }
}
