import React, { useEffect, useState } from 'react'
import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { useNotification } from 'web3uikit'
import { ethers } from 'ethers'
import { NavLink } from 'react-router-dom'
import {FaChessKing} from 'react-icons/fa'

const NFTBox = ({ price, nftAddress, tokenId, marketplaceAddress, seller }) => {
    const [imageUri, setImageUri] = useState()
    const [tokenName, setTokenName] = useState()
    const [tokenDesc, setTokenDesc] = useState()
    const [royalityFee, setRoyalityFee] = useState()
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
            setRoyalityFee(response.royalityFee)
        }
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])


    const isOwnedUser = seller === account || seller === undefined
    const formatteSellerAddress = isOwnedUser ? "you" : `${seller?.slice(0, 5)}...${seller?.slice(seller?.length - 4)}`


    return (
        
        <NavLink to={tokenId} state={{nftName:tokenName , owner:formatteSellerAddress, nftImage:imageUri , tokenId:tokenId , desc:tokenDesc, nftPrice:price , royalityFee:royalityFee , nftAddress:nftAddress, marketplaceAddress:marketplaceAddress}} key={tokenId}> 
        {
            imageUri ?
                (
                    <div>
                        <div className="shrink-0 rounded-lg border border-solid border-black bg-white w-64 hover:shadow-2xl hover:shadow-balck lg:my-8 lg:mx-12 md:mx-8 md:my-6 sm:mx-4 sm:my-4 xs:mx-4 xs:my-4">
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
                                        <FaChessKing className='inline mb-1'/> {`${((royalityFee / 10000) * 100).toFixed(1)}%`}
                                    </p>
                                </div>
                                <div className="flex flex-row justify-between">
                                    <p className="text-gray-800 break-words text-sm font-bold ">
                                        {tokenName}
                                    </p>
                                       <p className="break-words text-sm font-bold ">
                                           <svg
                                               className="inline w-3.5 h-3.5 mb-1"
                                               xmlns="http://www.w3.org/2000/svg"
                                               viewBox="0 0 320 512"
                                           >
                                               <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                                           </svg>
                                           {ethers.utils.formatUnits(price, "ether")}
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

export default NFTBox