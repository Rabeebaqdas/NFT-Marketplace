// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "../Token.sol";

error BasicNft__RoyalityFeesPercentageLimitExceed();
error BasicNft__DontHaveEnoughTokensToMintNFT();
error BasicNft__YouDidntProvideApprovalOFTokensForNFTMinting();
error BasicNft__TransferFailed();
contract BasicNft is ERC721URIStorage {
////////////////////////////////Struct//////////////////////////////////////////
struct Owner {
    uint256 numOfBips;
    address ownerOfNft;
}
    ////////////////////////////State Variables//////////////////////////////////
    
    // string public constant TOKEN_URI =
    //     "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter;

    /////////////////////////mapping////////////////////////////////////
    mapping(uint256 => Owner) private first_owner;

    //////////////////////////Events////////////////////////////////////
    event NFTMinted( address indexed owner, address indexed nftAddress, uint256 indexed tokenId);
    constructor() ERC721("Your NFT", "YN") {
        s_tokenCounter = 0;
    }

///////////////////////Main Function////////////////////////////////////

    function mintNft(string memory _tokenURI, uint256 _noOfBips, address _token) public returns (uint256) {
        MyToken token = MyToken(_token);
        uint256 tokensForNFTMinting = token.tokensRequriedForNFTMinting();
        if(token.balanceOf(msg.sender) < tokensForNFTMinting){
            revert BasicNft__DontHaveEnoughTokensToMintNFT(); 
        }
        if(token.allowance(msg.sender, address(this)) < tokensForNFTMinting) {
            revert BasicNft__YouDidntProvideApprovalOFTokensForNFTMinting();
        }
        if(_noOfBips > 1000) {
            revert  BasicNft__RoyalityFeesPercentageLimitExceed();
        }
        (bool success) = token.transferFrom(msg.sender, address(this), tokensForNFTMinting);

        if(!success) {
            revert BasicNft__TransferFailed();
        }

        _safeMint(msg.sender, s_tokenCounter);
        _setTokenURI(s_tokenCounter, _tokenURI);
        first_owner[s_tokenCounter] = Owner(_noOfBips, msg.sender);
        emit NFTMinted(msg.sender, address(this), s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;
        return s_tokenCounter;
    }
///////////////////////Getter Functions////////////////////////////////////

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getFirstOwner(uint256 tokenId) public view returns(address) {
        return first_owner[tokenId].ownerOfNft;
    }

     function getRoyalityFees(uint256 tokenId) public view returns(uint256) {
        return first_owner[tokenId].numOfBips;
    }
}