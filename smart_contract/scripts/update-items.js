const {ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const PRICE = ethers.utils.parseEther("2")
const TOKEN_ID = 2
const updateItem = async() => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketplace.updateListing(basicNft.address,TOKEN_ID,PRICE)
    await tx.wait(1)
    console.log("Item Updated!")
    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

const main = async() => {
    try {
        await updateItem()
        process.exit(0)
    }catch(err){
        console.log(err)
        process.exit(1)
    }
    }
    
    main()


