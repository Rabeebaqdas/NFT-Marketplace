//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./test/BasicNft.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);
error NftMarketplace__NoProceeds();
error NftMarketplace__TransferFailed();

contract NftMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    ////////////////////Mapping/////////////////////////////

    mapping(address => mapping(uint256 => Listing)) private s_listings;
    mapping(address => uint256) private s_proceeds;

    ////////////////////State Varaibles//////////////////////
    uint256 private margin = 250;
    address private immutable MarketplaceOwner;

    /////////////////////Events//////////////////////////////////

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event ItemCanceled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    /////////////////Modifiers//////////////////////////////

    modifier notListed(
        address nftAddress,
        uint256 tokenId,
        address owner
    ) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0) {
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0) {
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) {
            revert NftMarketplace__NotOwner();
        }
        _;
    }

    constructor() {
        MarketplaceOwner = msg.sender;
    }

    ///////////////////Main Funtions////////////////////

    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId, msg.sender)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) {
            revert NftMarketplace__PriceMustBeAboveZero();
        }

        IERC721 nft = IERC721(nftAddress);

        if (nft.getApproved(tokenId) != address(this)) {
            revert NftMarketplace__NotApprovedForMarketplace();
        }

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCanceled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function buyItems(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        nonReentrant
    {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (msg.value < listing.price) {
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listing.price
            );
        }

        BasicNft nft = BasicNft(nftAddress);
        address f_owner = nft.getFirstOwner(tokenId);
        address recentOwner = listing.seller;
        if (f_owner != recentOwner) {
            uint256 proceedForF_owner = royalityFeesCalculation(
                nftAddress,
                tokenId,
                listing.price
            );
            uint256 temp = FeesCalculationForMarketplace(listing.price);
            uint256 proceedsForRecentOwner = listing.price - proceedForF_owner;
            proceedsForRecentOwner = proceedsForRecentOwner - temp;
            s_proceeds[f_owner] = s_proceeds[f_owner] + proceedForF_owner;
            s_proceeds[listing.seller] = s_proceeds[listing.seller] + proceedsForRecentOwner;
            s_proceeds[MarketplaceOwner] = s_proceeds[MarketplaceOwner] + temp;
            delete (s_listings[nftAddress][tokenId]);
            IERC721(nftAddress).safeTransferFrom(
                listing.seller,
                msg.sender,
                tokenId
            );
            emit ItemBought(msg.sender, nftAddress, tokenId, listing.price);
        } else {
             uint256 temp = FeesCalculationForMarketplace(listing.price);
             uint256 proceedsForSeller = listing.price - temp;
            s_proceeds[listing.seller] = s_proceeds[listing.seller] + proceedsForSeller;
             s_proceeds[MarketplaceOwner] = s_proceeds[MarketplaceOwner] + temp;
            delete (s_listings[nftAddress][tokenId]);
            IERC721(nftAddress).safeTransferFrom(
                listing.seller,
                msg.sender,
                tokenId
            );
            emit ItemBought(msg.sender, nftAddress, tokenId, listing.price);
        }
    }

    function royalityFeesCalculation(
        address _nft,
        uint256 _tokenId,
        uint256 _price
    ) private view returns (uint256) {
        BasicNft nft = BasicNft(_nft);
        uint256 fee = nft.getRoyalityFees(_tokenId);
        return (_price / 10000) * fee;
    }

     function FeesCalculationForMarketplace(
        uint256 _price
    ) private view returns (uint256) {
        return (_price / 10000) * margin;
    }

    function withdrawProceeds() external {
        uint256 proceed = s_proceeds[msg.sender];
        if (proceed <= 0) {
            revert NftMarketplace__NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceed}("");
        if (!success) {
            revert NftMarketplace__TransferFailed();
        }
    }

    ////////////////////Getter Functions/////////////////

    function getListing(address nftAddress, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
