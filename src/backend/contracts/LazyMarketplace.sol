//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma abicoder v2; // required to accept structs as function parameters

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract LazyMarketplace is EIP712, ReentrancyGuard {
    string private constant SIGNING_DOMAIN = "LazyNFT-Voucher";
    string private constant SIGNATURE_VERSION = "1";
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
        uint256 tokenId,
        uint256 price,
        address indexed seller,
        address indexed buyer
    );

    // itemId -> Item
    // mapping(uint256 => Item) public items;

    constructor(uint256 _feePercent) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
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

    /// @notice Returns the chain id of the current blockchain.
    /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
    ///  the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    // TODO: uint256 price, address nft, uint256 nftTokenId
    function purchaseNFTItem(
        NFTItemVoucher calldata voucher,
        uint256 price,
        address nft,
        uint256 nftTokenId
    ) external payable nonReentrant {
        // make sure signature is valid and get the address of the signer
        address payable signer = payable(_verify(voucher));
        require(
            msg.value >= price,
            "not enough ETH to cover item price and market fee"
        );
        IERC721 _nft = IERC721(nft);
        // uint256 _totalPrice = (price * (100 + feePercent)) / 100;
        uint256 marketFee = (feePercent * price) / 100;
        // pay seller and feeAccount
        signer.transfer(price - marketFee);
        feeAccount.transfer(marketFee);
        // transfer nft to buyer
        _nft.transferFrom(signer, msg.sender, nftTokenId);
        // emit bought event
        emit Bought(nftTokenId, price, signer, msg.sender);
    }
}
