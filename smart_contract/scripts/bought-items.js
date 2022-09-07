const {ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 2;

const boughtItem = async() => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const listing = await nftMarketplace.getListing(basicNft.address,TOKEN_ID)
    const price = listing.price.toString()
    const tx = await nftMarketplace.buyItems(basicNft.address,TOKEN_ID,{value: price})
    await tx.wait(1)
    console.log("Item Bought!")
    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

const main = async() => {
    try {
        await boughtItem()
        process.exit(0)
    }catch(err){
        console.log(err)
        process.exit(1)
    }
    }
    
    main()


