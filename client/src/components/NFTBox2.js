import React, { useEffect, useState } from 'react'
import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { Card } from 'web3uikit'


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
        <div>
            <div>
                {
                    imageUri ?
                        (
                            <div>
                                
                                <Card title={tokenName} description={tokenDesc}>
                                    <div className='p-2'>
                                        <div className='flex flex-col items-end gap-2'>
                                            <div>#{tokenId}</div>
                                            <div className='italic text-sm'>Owned by {formatteSellerAddress}</div>
                                         

                                            <img src={imageUri} height="200" width="200" alt='image' />
                                            
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

export default NFTBox2