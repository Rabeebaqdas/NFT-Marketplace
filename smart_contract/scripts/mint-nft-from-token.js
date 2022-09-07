const {ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const tokenUri = "ipfs://QmNgzMdmk2QfYcFDJru6hrzVAif8dFvJ98KijVZhqxVEPB"
const mintNFTWithToken = async() => {
    const basicNft = await ethers.getContract("BasicNft")
    const token = await ethers.getContract("MyToken")
    console.log("Buying..............")
    const fees = await token.tokensRequriedForNFTMinting()

    const buy = await token.buyTokens(20, {value:fees })
    await buy.wait(1)
    console.log("Buying Done!")
    const account = await ethers.getSigners()
    const balance = await token.balanceOf(account[0].address)
    console.log(balance.toString())
    const fee = await token.tokensRequriedForNFTMinting()
    const approve = await token.approval(basicNft.address,fee)

    await approve.wait(1)
    console.log("Approved!")
    const allow = await token.allowance(account[0].address,basicNft.address)

    console.log("Amount",allow.toString())
    const getTokenCounter = await basicNft.getTokenCounter()
    console.log(getTokenCounter.toString())
    const mintTx = await basicNft.mintNft(tokenUri,250,token.address)
    const response = await mintTx.wait(1)
   const tokenId = response.events[1].args.tokenId
    console.log("NFT Minted!", tokenId.toString())

    if(network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

const main = async() => {
    try {
        await mintNFTWithToken()
        process.exit(0)
    }catch(err){
        console.log(err)
        process.exit(1)
    }
    }
    
    main()


