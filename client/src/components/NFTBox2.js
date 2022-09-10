import React, { useEffect, useState } from 'react'
import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { NavLink } from 'react-router-dom'


const NFTBox2 = ({nftAddress, tokenId, owner }) => {
    const [imageUri, setImageUri] = useState()
    const [tokenName, setTokenName] = useState()
    const [tokenDesc, setTokenDesc] = useState()

    const { isWeb3Enabled, account } = useMoralis()
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId
        }
    })



    const updateUI = async () => {
        const tokenURI = await getTokenURI()
        console.log("tokenURI",tokenURI)
        if (tokenURI) {
            // const requestURI = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const requestURI = tokenURI.replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/")

            const response = await (await fetch(requestURI)).json()
            const Image = response.image
            // const imgResponse = Image.replace("ipfs://", "https://ipfs.io/ipfs/")
            const imgResponse = Image.replace("https://gateway.pinata.cloud/ipfs/", "https://ipfs.io/ipfs/")

            setImageUri(imgResponse)
            setTokenName(response.name)
            setTokenDesc(response.description)
       

        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled,account])



    const isOwnedUser = owner === account || owner === undefined
    const formatteSellerAddress = isOwnedUser ? "you" : ""




    return (
        <NavLink to={tokenId} state={{nftName:tokenName , owner:formatteSellerAddress, nftImage:imageUri , tokenId:tokenId , desc:tokenDesc, nftAddress:nftAddress}} key={tokenId}> 
        {
            imageUri ?
                (
                    <div>
                        
                      
                        <div className="shrink-0 rounded-lg border border-solid border-black bg-white w-64  hover:shadow-2xl hover:shadow-balck lg:my-8 lg:mx-12 md:mx-8 md:my-6 sm:mx-4 sm:my-4 xs:mx-4 xs:my-4">
                            <img
                               className="w-full h-64 object-cover rounded-t-lg"
                                src={imageUri}
                                alt={tokenName}
                            />
                            <div className="p-6">
                                <div className="flex flex-row justify-between">
                                    <p className="text-gray-500 text-sm font-medium mb-4">
                                        Owned by {formatteSellerAddress}
                                    </p>
                                    <p className="text-gray-500 text-sm font-medium mb-4">
                                        #{tokenId}
                                    </p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="text-gray-800 break-words text-sm font-bold ">
                                        {tokenName}
                                    </p>
                                    <p className="text-gray-300 break-words text-sm font-bold ">
                                        Unlisted
                                    </p>
                                </div>
                            </div>
                        </div>
                            
                    </div>
                )
                :
                <div>Loading....</div>
        }
    </NavLink>
    )
}

export default NFTBox2