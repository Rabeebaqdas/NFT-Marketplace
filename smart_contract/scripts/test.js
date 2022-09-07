const { ethers,network } = require("hardhat")
const {moveBlocks} = require("../utils/move-blocks")

const tokenUri = "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
const PRICE = ethers.utils.parseEther("100")
const ROYALITYFEES = 250 //in terms of Bips 1 = 0.01%
const test = async () => {
    console.log("Initializing.................")
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const token = await ethers.getContract("MyToken")
    console.log("Buying Token...........")
    const fees = await token.tokensRequriedForNFTMinting()
    const buy = await token.buyTokens(20, {value:fees })
    await buy.wait(1)
    console.log("Buying Done!")
    console.log("Giving Approval..........")
    const fee = await token.tokensRequriedForNFTMinting()
    const approve = await token.approval(basicNft.address,fee)
    await approve.wait(1)
    console.log("Approved!")
    const account = await ethers.getSigners()
    const allow = await token.allowance(account[0].address,basicNft.address)
    console.log("Amount",allow.toString())
    console.log("Minting................")
    const mintTx = await basicNft.mintNft(tokenUri,ROYALITYFEES,token.address)
    const response = await mintTx.wait(1)
    const tokenId = response.events[1].args.tokenId
    console.log(`Approving Nft of TokenID : ${tokenId}............`)
    const approval = await basicNft.approve(nftMarketplace.address,tokenId)
    await approval.wait(1)
    console.log("Listing Nft..................")
    const tx = await nftMarketplace.listItem(basicNft.address,tokenId,PRICE)
    await tx.wait(1)
    console.log("NFT Listed......................")
    console.log("Buying NFT......................")
    const buyer = nftMarketplace.connect(account[1])
    console.log("Account Changed......................")

    const listing = await buyer.getListing(basicNft.address,tokenId)
    const price = listing.price.toString()
    const taax = await buyer.buyItems(basicNft.address,tokenId,{value: price})
    await taax.wait(1)
    console.log("Item Bought!")
    const f_ownerProceed = await nftMarketplace.getProceeds(account[0].address) 
    console.log("proceeds",f_ownerProceed.toString());
    console.log("Again Listing.............")
    const buyerNFT = basicNft.connect(account[1])
    const approval2 = await buyerNFT.approve(nftMarketplace.address,tokenId)
    await approval2.wait(1)
    console.log("Listing Nft..................")
    const tx2 = await buyer.listItem(basicNft.address,tokenId,PRICE)
    await tx2.wait(1)
    console.log("NFT Listed......................")
    const third = nftMarketplace.connect(account[2])
    console.log("Account Changed......................")
    console.log("NFT Buying Again......................")
    const listing2 = await third.getListing(basicNft.address,tokenId)
    const price2 = listing2.price.toString()
    const taaax = await third.buyItems(basicNft.address,tokenId,{value: price2})
    await taaax.wait(1)
    console.log("Item Bought!")
    const newFirstOwner = await nftMarketplace.getProceeds(account[0].address) 
   const val = ethers.utils.formatUnits(newFirstOwner,"ether")
    const secondOwner = await buyer.getProceeds(account[1].address) 
   const val2 = ethers.utils.formatUnits(secondOwner,"ether")

    console.log("new proceeds of First Owner",val);
    console.log("new proceeds of Second Owner",val2.toString());
 
}

const main = async() => {
try {
    await test()
    process.exit(0)
}catch(err){
    console.log(err)
    process.exit(1)
}
}

main()

