const {ethers, network} = require("hardhat")
const {moveBlocks} = require("../utils/move-blocks")
const tokenUri = "ipfs://QmNgzMdmk2QfYcFDJru6hrzVAif8dFvJ98KijVZhqxVEPB"
const PRICE = ethers.utils.parseEther("0.1")
const mintAndList = async () => {
    console.log("Initializing.................")
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft") 
    console.log("Minting................")
    const mintTx = await basicNft.mintNft(tokenUri)
    const response = await mintTx.wait(1)
    const tokenId = response.events[0].args.tokenId
    console.log("Approving Nft............")
    const approval = await basicNft.approve(nftMarketplace.address,tokenId)
    await approval.wait(1)
    console.log("Listing Nft..................")
    const tx = await nftMarketplace.listItem(basicNft.address,tokenId,PRICE) 
    await tx.wait(1)
    console.log("NFT Listed......................")

    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

const main = async() => {
try {
    await mintAndList()
    process.exit(0)
}catch(err){
    console.log(err)
    process.exit(1)
}
}

main()

