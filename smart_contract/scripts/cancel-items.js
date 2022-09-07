const {ethers, network} = require("hardhat")
const {moveBlocks} = require("../utils/move-blocks")
const TOKEN_ID = 5;

const cancel = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    const basicNft = await ethers.getContract("BasicNft")
    const tx = await nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFt Canceled!")
    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

const main = async() => {
try {
    await cancel()
    process.exit(0)
}catch(err){
    console.log(err)
    process.exit(1)
}
}

main()

