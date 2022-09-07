const { ethers, network } = require("hardhat")
const fs = require("fs")
const frontendContractFile = "../client/src/constants/networkMapping.json"
const frontendAbi = "../client/src/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONTEND) {
        console.log("updating front end........")
         await updateContractAddresses();
        await updateAbi()
        console.log("Frontend Updated Successfully")
    }
}

const updateContractAddresses = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
     const basicNft = await ethers.getContract("BasicNft")
     const token = await ethers.getContract("MyToken")
    const chainId = network.config.chainId.toString()
    const contractAddress = JSON.parse(fs.readFileSync(frontendContractFile, "utf-8"))
    if (chainId in contractAddress) {
        if (!contractAddress[chainId]["NftMarketplace"].includes(nftMarketplace.address) && !contractAddress[chainId]["BasicNft"].includes(basicNft.address) && !contractAddress[chainId]["MyToken"].includes(token.address)) {
            contractAddress[chainId]["NftMarketplace"].push(nftMarketplace.address)
            contractAddress[chainId]["BasicNft"].push(basicNft.address)
            contractAddress[chainId]["MyToken"].push(token.address)
        } else {
             contractAddress[chainId] = { "NftMarketplace": [nftMarketplace.address], "BasicNft": [basicNft.address], "MyToken":[token.address] }
        }
        console.log("Done with marketplaceAddress")

    }

   fs.writeFileSync(frontendContractFile, JSON.stringify(contractAddress))

}

const updateAbi = async () => {
    const nftMarketplace = await ethers.getContract("NftMarketplace")
    fs.writeFileSync(`${frontendAbi}Nftmarketplace.json`, nftMarketplace.interface.format(ethers.utils.FormatTypes.json))
    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(`${frontendAbi}basicNft.json`, basicNft.interface.format(ethers.utils.FormatTypes.json))
    const token = await ethers.getContract("MyToken")
    fs.writeFileSync(`${frontendAbi}marketplaceToken.json`, token.interface.format(ethers.utils.FormatTypes.json))

}
module.exports.tags = ['all', 'frontend']