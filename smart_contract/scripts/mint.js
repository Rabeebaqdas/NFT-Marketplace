const {ethers, network} = require("hardhat")
const { moveBlocks } = require("../utils/move-blocks")
const tokenUri = "ipfs://QmNgzMdmk2QfYcFDJru6hrzVAif8dFvJ98KijVZhqxVEPB"
const mint = async() => {
    const basicNft = await ethers.getContract("BasicNft")
    console.log("Minting................")
    const mintTx = await basicNft.mintNft(tokenUri)
    const response = await mintTx.wait(1)
    const tokenId = response.events[0].args.tokenId
    const tokenURI = await basicNft.tokenURI(tokenId)
    console.log(`Got TokenId: ${tokenId}`)
    console.log(`Got tokenURI: ${tokenURI}`)

    console.log(`NFT Contract Address: ${basicNft.address}`)
    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }

}

const main = async() => {
    try {
        await mint()
        process.exit(0)
    }catch(err){
        console.log(err)
        process.exit(1)
    }
    }
    
    main()
    

