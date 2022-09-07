import React, { useEffect, useState } from 'react'

import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { Card, useNotification } from 'web3uikit'
import { ethers } from 'ethers'
import UpdateListingModal from './UpdateListingModal'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"

const NFTBox = ({ price, nftAddress, tokenId, marketplaceAddress, seller }) => {
    const [imageUri, setImageUri] = useState()
    const [tokenName, setTokenName] = useState()
    const [tokenDesc, setTokenDesc] = useState()
    const [royalityFee, setRoyalityFee] = useState()
    const [showModal, setShoModal] = useState(false)
    const dispatch = useNotification()

    const { isWeb3Enabled, account } = useMoralis()
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId
        }
    })

    const {runContractFunction: buyItems} = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItems",
        msgValue: price,
        params: {
            nftAddress : nftAddress,
            tokenId : tokenId
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

const buyingSuccess = async(tx) => {
    await tx.wait(1)
    dispatch({
        type: "success",
        title: "Item Bought",
        message: "Item bought - please refresh (and move blocks) ",
        position: "topR"
    })
}

const buyingError = () => {
    dispatch({
        type: "error",
        title: "Transaction Failed",
        message: "Buying canceled - you have rejected the transaction",
        position: "topR"
    })
}

    const isOwnedUser = seller === account || seller === undefined
    const formatteSellerAddress = isOwnedUser ? "you" : `${seller?.slice(0, 5)}...${seller?.slice(seller?.length - 4)}`

    const handleCardClick = () => {
        isOwnedUser ? setShoModal(true) : buyItems({
            onSuccess: buyingSuccess,
            onError: buyingError
        })
    }

   const closeModal = () => {
    setShoModal(false)
   }
    return (
        <div>
            <div>
                {
                    imageUri ?
                        (
                            <div>
                                <UpdateListingModal isVisible={showModal} onClose={closeModal} marketplaceAddress={marketplaceAddress} tokenId={tokenId} nftAddress={nftAddress} price={price} />
                                <Card title={tokenName} description={tokenDesc} onClick={handleCardClick}>
                                    <div className='p-2'>
                                        <div className='flex flex-col items-end gap-2'>
                                            <div>#{tokenId}</div>
                                            <div className='italic text-sm'>Owned by {formatteSellerAddress}</div>
                                            <img src={imageUri} height="200" width="200" alt='image' />
                                            <div className='font-bold'>{ethers.utils.formatUnits(price, "ether")} ETH</div>
                                                    <div className='italic text-sm'>Royality Fee: {`${(royalityFee / 10000) * 100}%`}</div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )
                        :
                        <div>Loading....</div>
                }
            </div>
        </div>
    )
}

export default NFTBox