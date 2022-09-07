import React, { useState, useEffect } from 'react'
import { Button, Form, useNotification } from 'web3uikit'
import { ethers } from "ethers"
import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"
import networkMapping from "../constants/networkMapping.json"


const ListNft = () => {

  const {runContractFunction, isLoading} = useWeb3Contract()
  const [proceeds, setProceeds] = useState(0)
  const { chainId, account, isWeb3Enabled } = useMoralis() //return in hex
  const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]  
  const NFTContractAddress = networkMapping[chainIdString].BasicNft[0]
  const dispatch = useNotification()

  const approveAndList = async (data) => {
    console.log("Approving.........")
    const nftAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const price = ethers.utils.parseUnits(data.data[2].inputResult, "ether").toString()

    const approveOptions = {
      abi: nftAbi,
      contractAddress: nftAddress,
      functionName: "approve",
      params: {
        to: marketplaceAddress,
        tokenId: tokenId
      }
    }
    console.log("Approved!")

    await runContractFunction({
      params: approveOptions,
      onSuccess: () => approveSuccess(nftAddress, tokenId, price),
      onError: (err) => console.log(err)
    })

  }


  const approveSuccess = async (nftAddress, tokenId, price) => {
    console.log("Now Listing...........")
    const listOption = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: price
      }
    }

    await runContractFunction({
      params: listOption,
      onSuccess: listingSuccess,
      onError: listingError
    })

  }

  const listingSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
      type: "success",
      title: "Listing Success",
      message: "NFT has been listed",
      position: "topR"
    })
    setTimeout(()=>window.location.replace("/mynft"), 5000) 
  }

  const listingError = () => {
    dispatch({
      type: "error",
      title: "Listing Failed",
      message: "Listing canceled - you have rejected the transaction",
      position: "topR"
    })
  }
  const getProceed = async () => {

    const returnedProceeds = await runContractFunction({
      params: {
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "getProceeds",
        params: {
          seller: account
        }
      },
      onError: (err) => console.log(err)
    })

    if (returnedProceeds) {
      setProceeds(returnedProceeds.toString())
    }
  }

const withdrawOptions = {
  abi:nftMarketplaceAbi,
  contractAddress:marketplaceAddress,
  functionName:"withdrawProceeds",
  params: {}
}
  const withdraw = async () => {
    await runContractFunction({
      params: withdrawOptions,
      onSuccess: withdrawSuccess,
      onError: withdrawFail
    })
  }

  const withdrawFail = () => {
    dispatch({
      type:"error",
      title:"Transaction Failed",
      message:"MetaMask Tx Signature: User denied transaction signature.",
      position:"topR"
    })
  }

  const withdrawSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
      type: "success",
      title: "Withdraw Proceeds",
      message: "Proceeds has been received successfully",
      position: "topR",
    })
  }

  const cancelListedNFT = async (data) => {
    const nftAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const cancelListingOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "cancelListing",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId
      }
    }

    await runContractFunction({
      params: cancelListingOptions,
      onSuccess: cancelingSuccess,
      onError: cancelingFailed
    })
  }

  const cancelingFailed = () => {
    dispatch({
      type: "error",
      title: "Cancellation Failed",
      message: "Action revered - you have rejected the transaction",
      position: "topR",
    })
  }

  const cancelingSuccess = async (tx) => {
    await tx.wait(1)
    dispatch({
      type: "success",
      title: "Cancellation Succeed",
      message: "NFT's listing has been canceled successfully",
      position: "topR",
    })
    setTimeout(()=>window.location.replace("/mintednft"), 5000) 

  }

  useEffect(() => {
    if (isWeb3Enabled) {
      getProceed()
    }
  }, [account, isWeb3Enabled, chainId])

  return (

    <div className='container mx-auto'>
      <h1 className='py-4 px-4 font-bold text-2xl'>List your NFT!</h1>
      <h6 className='py-4 px-4 font-bold text-1xl mb-2'>NFT Contract Address: <i className='text-green-600 text-sm'>{NFTContractAddress}</i></h6>

      {isWeb3Enabled ?
        <Form
          onSubmit={approveAndList}
          data={[
            {
              name: "NFT Address",
              type: "text",
              inputWidth: "50%",
              value: "",
              key: "nftAddress"
            },
            {
              name: "Token ID",
              type: "number",
              value: "",
              inputWidth: "50%",
              key: "tokenId"
            },
            {
              name: "Price (in ETH)",
              type: "number",
              value: "",
              inputWidth: "50%",
              key: 'price'
            }
          ]}
          title="This is the form for listing the NFT"
          id='Main Form'
          isDisabled={isLoading}
        /> : "Web3 Currently Not Enabled"}
      {
        isWeb3Enabled ?
          (<div>

            {proceeds == 0
              ?
              "No Proceeds Available"
              :

              (
                
                <div className='ml-5'>
                   <div className='border-b-2 my-5'></div>
                   <h1 className='py-4 px-4 font-bold text-2xl'>Withdraw Proceeds!</h1>
                   <h6 className='py-4 px-4 font-bold text-1xl mb-2'>Total Amount: <i className='text-green-600 text-lg'>{ethers.utils.formatUnits(proceeds, "ether")} ETH</i></h6>
         
      <Button size='large' text='Withdraw Proceeds' color='green' theme='colored' isFullWidth="true" onClick={withdraw} disabled={isLoading} />

                </div>
              )
            }
          </div>) : ""}
      <div className='border-b-2 my-5'></div>
      <div>
        <h1 className='py-4 px-4 font-bold text-2xl'>Cancel Listing!</h1>
        {isWeb3Enabled ?
          <Form
            onSubmit={cancelListedNFT}
            data={[
              {
                name: "NFT Address",
                type: "text",
                inputWidth: "50%",
                value: "",
                key: "nftAddress"
              },
              {
                name: "Token ID",
                type: "number",
                value: "",
                inputWidth: "50%",
                key: "tokenId"
              }
            ]}
            title="This is the form for cancel the NFT listing"
            id='Main Form'
            isDisabled={isLoading}
          />
          :
          "Web3 Currently Not Enabled"

        }
      </div>
    </div>
  )
}

export default ListNft