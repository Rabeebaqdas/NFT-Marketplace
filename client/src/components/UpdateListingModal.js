import React, { useState } from 'react'
import { Modal, Input, useNotification } from 'web3uikit'
import { useWeb3Contract } from 'react-moralis'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"
import {ethers} from "ethers"

const UpdateListingModal = ({nftAddress,marketplaceAddress, tokenId, isVisible, onClose}) => {
    const [newPrice,setNewPrice] = useState(0)
    const dispatch = useNotification()
    const {runContractFunction: updateListing, isLoading } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "updateListing",
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
            newPrice: ethers.utils.parseEther(newPrice || "0") 
        }
    })


    const listingSuccess = async(tx) => {
        console.log("waiting...........")
        await tx.wait(1)
        console.log("success...........")

        dispatch({
            type: "success",
            title:"Listing Updated",
            message: "Listing updated - please refresh (and move blocks)",
            position: "topR"
        })
        onClose && onClose()
        setNewPrice(0)

    }
    const listingError = () => {
        dispatch({
            type: "error",
            title:"Transaction Failed",
            message: "Listing canceled - you have rejected the transaction",
            position: "topR"
        })
        onClose && onClose()
        setNewPrice(0)
    }

  return (
    <div>
        <Modal 
        isVisible={isVisible}
        onCancel={onClose}
        onCloseButtonPressed={onClose}
        onOk={()=>{updateListing({
            onError: listingError,
                onSuccess: listingSuccess
            
            }
        )}}
        isOkDisabled={newPrice === 0 || isLoading}
        isCancelDisabled={isLoading}
        
        >
            <Input
            label='Update listing price in L1 Currency (ETH)'
            name='New listing price'
            type='number'
            onChange={(e)=>setNewPrice(e.target.value)}
            />
        </Modal>
    </div>
  )
}

export default UpdateListingModal