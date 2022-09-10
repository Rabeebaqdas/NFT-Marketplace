import React, { useEffect, useState } from 'react'
import Moralis from 'moralis-v1'
import NFTBox from '../components/NFTBox'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"
import networkMapping from "../constants/networkMapping.json"
import { useNotification } from 'web3uikit'
import { ethers } from 'ethers'
import Mynft from "../imgs/Mynft.svg";
import web3 from "../imgs/web3.svg";


const MyNFT = () => {
  const { runContractFunction, isLoading } = useWeb3Contract()
  const [isConnected, setIsConnected] = useState()
  const [data, setData] = useState([])
  const [proceeds, setProceeds] = useState(0)
  const [loading, setLoading] = useState(true)
  const { isWeb3Enabled, account, chainId } = useMoralis()
  const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainIdString].NftMarketplace[0]
  const dispatch = useNotification()


  useEffect(() => {
    setIsConnected(Moralis.start({ serverUrl: process.env.REACT_APP_SERVER_URL, appId: process.env.REACT_APP_APP_ID }))
  }, [])

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

  const withdraw = async () => {

    const withdrawOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "withdrawProceeds",
      params: {}
    }

    await runContractFunction({
      params: withdrawOptions,
      onSuccess: withdrawSuccess,
      onError: withdrawFail
    })
  }

  const withdrawFail = () => {
    dispatch({
      type: "error",
      title: "Transaction Failed",
      message: "MetaMask Tx Signature: User denied transaction signature.",
      position: "topR"
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
    setTimeout(()=>window.location.reload(),5000)
  }




  useEffect(() => {

    const get = async () => {

      try {
        if (isConnected) {
          const query = await new Moralis.Query("ActiveItem").ascending("tokenId").equalTo("seller", account).find()
          setData(query)
          console.log(query)
          setLoading(false)
        }
      } catch (err) {
        console.log(err)
      }
    }
    get()

    getProceed()
  }, [isConnected, account, chainId, isWeb3Enabled])



  return (
    <div className='w-full gradient-css-div-explore'>
      <h1 className='py-4 px-4 font-bold text-2xl'>MY NFTs</h1>
      {
        isWeb3Enabled ? (
          <div className='flex flex-wrap'>
          {data.length !== 0 ? (
  
  
            loading ? (<div>Loading......</div>) :
              (
                data.map((nft) => {
  
                  const { price, nftAddress, tokenId, marketplaceAddress, seller } = nft.attributes
                  return (
                    <div className='mx-12'>
                      <NFTBox
                        price={price}
                        nftAddress={nftAddress}
                        tokenId={tokenId}
                        marketplaceAddress={marketplaceAddress}
                        seller={seller}
                        key={`${nftAddress} ${tokenId}`}
                      />
                    </div>
                  )
  
                })
              )
  
          ) :
            <>
              <div className="flex py-10 flex-col w-full h-full gradient-css-div-noneFound">
                <img src={Mynft} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
                <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">You haven't listed any NFTs to the marketplace yet!</p>
              </div>
            </>
  
  
          }
        </div>
        ):  <>
        <div className="flex py-10 flex-col w-full h-full">
        <img src={web3} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
        <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">Oops! looks like Web3 Conenction failed</p>
</div>
 </>
      }

      <div className="flex flex-col" >
        {
          isWeb3Enabled ? (
            <div className="details-div mt-3 px-4 py-2 rounded-md border border-gray-400 w-2/5 self-center">
            <p className="font-bold text-green-400 lg:text-2xl md:text-xl sm:text-lg">Current Proceeds</p>
            <div className="flex flex-row my-3">
              <p className="font-semibold lg:text-lg md:text-base sm:text-sm">Current Amount:</p>
              <p className="px-2 lg:text-lg md:text-base sm:text-sm text-green-400 font-bold">{ethers.utils.formatEther(proceeds, "ether")} <svg
                className="inline w-3.5 h-3.5 mb-1 stroke-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
              >
                <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
              </svg></p>
            </div>
            <div className="flex flex-col py-2">
              {proceeds > 0 ? <button className="text-white font-bold bg-green-500 rounded-md p-2 self-center ring-1 ring-gray-700 hover:bg-white hover:text-green-500 hover:ring-green-500" onClick={withdraw} disabled={isLoading}>Withdraw Proceeds</button> : ""}
            </div>
          </div>
          ) : ""
        }
      </div>
    </div>
  )
}

export default MyNFT
