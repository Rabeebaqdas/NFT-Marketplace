import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AiOutlineCheckCircle } from 'react-icons/ai'
import { prominent } from 'color.js'
import './styles.css'
import { useNotification } from 'web3uikit'
import { ethers } from "ethers"
import nftAbi from '../constants/basicNft.json'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"
import networkMapping from "../constants/networkMapping.json"

export const NotListedDetails = () => {
    const location = useLocation()
    const data = location.state
    console.log(data);
    const [color, setColor] = useState([]);
    const [dominant, setDominant] = useState() 
    const {runContractFunction, isLoading} = useWeb3Contract()
    const [price, setPrice] = useState()

    const { chainId } = useMoralis() //return in hex
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
    const dispatch = useNotification()
     
    const getColorPallete = () => {
        prominent(data.nftImage, { amount: 3, format: 'hex' }).then(clr => {
            setColor(clr);
        })

        prominent(data.nftImage, { amount: 1, format: 'hex' }).then(clr => {
            setDominant(clr + "65");
        })
    }

    
  const approveAndList = async (e) => {
    e.preventDefault();
    console.log("Approving.........")
    const nftAddress = data.nftAddress
    const tokenId = data.tokenId
    const Price = ethers.utils.parseUnits(price, "ether").toString()

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
      onSuccess: () => approveSuccess(nftAddress, tokenId, Price),
      onError: (err) => console.log(err)
    })

  }


  const approveSuccess = async (nftAddress, tokenId, Price) => {
    console.log("Now Listing...........")
    const listOption = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
        nftAddress: nftAddress,
        tokenId: tokenId,
        price: Price
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
    setPrice("")
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

    useEffect(() => {

        getColorPallete()
        console.log(dominant)

    }, [data?.nftImage]);



    return (
        <div className="h-full rounded-br-xl" style={{ backgroundImage: `linear-gradient(to top right, #90cef400,#90cef400,${dominant}, #90cef400, #90cef400)` }}>
            <br />
            <div className="flex justify-evenly items-start">
                <div>
                    <div className="w-96  ring-1 ring-gray-400 rounded-md flex flex-col justify-center items-end">
                        <img
                            className="h-96 w-96 rounded-t-md"
                            src={data.nftImage}
                            alt={data.nftName}
                        />
                        <div className="p-2.5 rounded-md">
                            <div className="flex flex-row justify-end">
                                <p className="mx-2.5 -mt-1 text-lg font-semibold">Token Id: #{data.tokenId}</p>
                            </div>
                        </div>
                    </div>
                    <div className="ring-1 ring-gray-400 rounded-md mt-4">
                        <div className="text-2xl font-bold border-b border-gray-400 px-1.5 py-1">
                            Color Pallete
                        </div>
                        <div className="flex flex-col py-3 px-6 justify-between h-36">
                            {color ? color.map((clr) => (
                                <div className="flex flex-row items-center">
                                    <div className="rounded-full ring-2 ring-black w-8 h-8 mr-3" style={{ backgroundColor: clr }}></div>
                                    <p className="text-base font-medium">{clr}</p>
                                </div>
                            )) : (
                                <div className="flex flex-row items-center">
                                    <p>Loading...</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                <div className="flex-col  w-8/12  ">
                    <div className=" px-4 py-2 rounded-md border border-gray-400 details-div">
                        <p className="text-md font-medium text-gray-500">Owned by {data.owner}</p>
                        <p className="py-5 text-4xl font-bold">{data.nftName}</p>
                        <p className="py-5 text-2xl font-bold text-gray-600">Description:</p>
                        <p className=" pb-5 text-lg font-bold text-gray-400">{data.desc}</p>
                        <p className="text-md font-medium text-gray-700 mt-5">
                            Fill The Following:
                        </p>
                        <form className="flex flex-col" onSubmit={approveAndList}>
                            <input className='bg-gray-300 my-3.5 rounded-lg p-2 w-1/2 ring-1 ring-gray-400 focus:outline-0' type="text" name="contractAddress" id="contractAddress" placeholder={data.nftAddress} required readOnly />
                            <input className='bg-gray-300 focus:outline-0  my-3.5 rounded-lg p-2 w-1/2 ring-1 ring-gray-400 ' type="text" name="tokenId" id="tokenId" placeholder={data.tokenId} required readOnly/>
                            <input className='my-3.5 rounded-lg p-2 w-1/2 ring-1 ring-gray-400 ' type="number" name="price" id="price" placeholder='Price (In ETH)' value={price} onChange={(e)=>setPrice(e.target.value)} disabled={isLoading} required />
                        <button type="submit" className="bg-cyan-500 py-1 w-40 h-10 rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-cyan-600" isDisabled={isLoading}>
                            <AiOutlineCheckCircle className="inline w-6 h-6 mr-2 mb-1" />
                            List My NFT
                        </button>
                        </form>
                    </div>
                </div>
            </div>
            <br></br>
            <hr></hr>
        </div>
    )
}