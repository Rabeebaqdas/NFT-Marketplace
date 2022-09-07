const Moralis = require("moralis/node")
require("dotenv").config()
const contractAddresses = require("./src/constants/networkMapping.json")
const chainId = process.env.chainId || 31337
let moralisChainId = chainId == "31337" ? "1337" : chainId
const contractAddress = contractAddresses[chainId]["NftMarketplace"][0]
const basicNftAddress = contractAddresses[chainId]["BasicNft"][0]
const serverUrl = process.env.REACT_APP_SERVER_URL
const appId = process.env.REACT_APP_APP_ID
const masterKey = process.env.master_key

const main = async () => {
    await Moralis.start({ serverUrl, appId, masterKey })
    console.log(`Working with contract Address ${contractAddress}`)

    let itemListedOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemListed(address, address, uint256, uint256)",
        address: contractAddress,
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "ItemListed",
            "type": "event"
        },
        tableName: "ItemListed",
    }

    let itemBoughtOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemBought(address, address, uint256, uint256)",
        address: contractAddress,
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "buyer",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "price",
                    "type": "uint256"
                }
            ],
            "name": "ItemBought",
            "type": "event"
        },
        tableName: "ItemBought",
    }

    let itemCanceledOptions = {
        chainId: moralisChainId,
        sync_historical: true,
        topic: "ItemCanceled(address, address, uint256)",
        address: contractAddress,
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "seller",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ItemCanceled",
            "type": "event"
        },
        tableName: "ItemCanceled",
    }
   
    let nftMinted = {
        chainId: moralisChainId,
        sync_historical: true,
        topic: "NFTMinted(address, address, uint256)",
        address: basicNftAddress,
        abi: {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "nftAddress",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "NFTMinted",
            "type": "event"
        },
        tableName: "NFTMinted",
    }

    const listedResponse = await Moralis.Cloud.run("watchContractEvent", itemListedOptions, {
        useMasterKey: true,
    })
    const boughtResponse = await Moralis.Cloud.run("watchContractEvent", itemBoughtOptions, {
        useMasterKey: true,
    })
    const canceledResponse = await Moralis.Cloud.run("watchContractEvent", itemCanceledOptions, {
        useMasterKey: true,
    })
    const nftMintedResponse = await Moralis.Cloud.run("watchContractEvent", nftMinted, {
        useMasterKey: true,
    })

    if (listedResponse.success && boughtResponse.success && canceledResponse.success && nftMintedResponse.success) {
        console.log("Success! Database Updated with watching events")
    } 


    else {
        console.log("Something went wrong...")
    }
}

const runMain = async () => {
    try {
        await main()
        process.exit(1)
    } catch (err) {
        console.log(err)
        process.exit(0)
    }
}

runMain()