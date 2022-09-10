import React, { useEffect, useState } from 'react'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { useNotification } from 'web3uikit'
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping.json"
import tokenAbi from '../constants/marketplaceToken.json';
import web3 from "../imgs/web3.svg";

const BuyTokens = () => {
  const {runContractFunction, isLoading} = useWeb3Contract()
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [totalSupply, setSupply] = useState()
    const [remaining, setRemainingTokens] = useState()
    const [price, setPrice] = useState()
    const [owner, setowner] = useState()
    const [noOfTokens, setnoOfTokens] = useState()



    const [bal, setBal] = useState()


  const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
  const tokenAddress = networkMapping[chainIdString].MyToken[0]  
  const dispatch = useNotification()

  const Owner = async() => {
    const options = {
        abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "owner",
        params: {}  
    }
    const ownerofContract = await runContractFunction({
        params: options
      })
      
     setowner(ownerofContract)
  }

  const avaibleTokens = async() => {
    const options = {
        abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "totalSupply",
        params: {}
    }

   const supply =  await runContractFunction({
        params: options
      })
      setSupply(ethers.utils.formatEther(supply, "ether")?.toString())
  }

  const remainingTokens = async() => {
    const options = {
        abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "remainingTokens",
        params: {}
    }

   const supply =  await runContractFunction({
        params: options
      })
      setRemainingTokens(ethers.utils.formatEther(supply, "ether")?.toString())
   
  }
  const priceofToken = async() => {
    const options = {
        abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "pricePerToken",
        params: {}
    }

   const supply =  await runContractFunction({
        params: options
      })
   setPrice(ethers.utils.formatEther(supply,"ether")?.toString())
  }

    const buy = async(e) => {
      e.preventDefault();
      const tokens = noOfTokens
      const value = price * tokens
         const Price = ethers.utils.parseUnits(value.toString(), "ether")?.toString()


          const options = {
              abi: tokenAbi,
          contractAddress: tokenAddress,
          functionName: "buyTokens",
           msgValue:Price,
          params: {
              _value: tokens
          }
          }
          
          await runContractFunction({
              params: options,
              onSuccess: buySuccess,
              onError: buyFailed
            })
      }

    const buySuccess = async(tx) => {
        await tx.wait(1)
        dispatch({
          type: "success",
          title: "Buying Succeed!",
          message: "ou have successfully bought the tokens",
          position: "topR"
        })
        setnoOfTokens("")
        setTimeout(()=>window.location.reload(),5000)
        
      }

      const buyFailed = () => {
        dispatch({
          type: "error",
          title: "Buying Failed",
          message: "Buying canceled - you have rejected the transaction",
          position: "topR"
        })
      }

      const withdraw =async () => {
        const options = {
            abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "withdrawMoney",
        params: {}
        }
        
        await runContractFunction({
            params: options,
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
        setTimeout(()=>window.location.reload(),5000)
      }

      const totalAmount =async () => {
        const options = {
            abi: tokenAbi,
        contractAddress: tokenAddress,
        functionName: "totalAmount",
        params: {}
        }
        
      const balance = await runContractFunction({
            params: options
          })
          setBal(balance)
      }

    

  useEffect(()=>{

    avaibleTokens()
    remainingTokens()
     priceofToken()
     totalAmount()

  },[account,chainId,isWeb3Enabled])

  useEffect(()=>{
    Owner()
  },[account])







    
 

  return (
<div className='w-full flex flex-col gradient-css-div'>
  {
    isWeb3Enabled ?  (
      <div className='flex flex-row justify-around my-4'>
      <div className='w-1/3 ring-2 ring-gray-400 m-3 rounded-md details-div '>
        <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Total Supply: <i className='text-green-600 text-md'>{totalSupply} DC</i></h6>
        <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Available Tokens: <i className='text-red-600 text-md'>{remaining} DC</i></h6>
        <h6 className='py-4 px-4 font-bold text-1xl mb-2'>Dex Coin Address: <i className='text-green-600 text-sm'>{tokenAddress}</i></h6>
      </div>

      <div className='w-1/3 ring-2 ring-gray-400 m-3 rounded-md details-div py-3 px-4'>
          <>
            <p className='text-xl font-bold text-gray-600'>Buy Dex Coin For minting NFT!</p>
            <form className='flex flex-col' onSubmit={buy}> 
              <input className='my-3.5 rounded-lg p-2 w-2/3 ring-1 my-8 ring-gray-400 self-center ' type="number" name="tokensNumber" id="tokensNumber" value={noOfTokens} placeholder='Number of Tokens you want to buy' onChange={(e)=>setnoOfTokens(e.target.value)} required />
              <button type='submit' className="bg-cyan-500 py-1 w-40 h-10 self-center rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-cyan-600" disabled={isLoading}>
                Buy Tokens
              </button>
            </form>
          </>
        

      </div>
    </div>
    ) : <>
    <div className="flex py-10 flex-col w-full h-full">
    <img src={web3} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
    <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">Oops! looks like Web3 Conenction failed</p>
</div>
</>
  }

      <div className='flex flex-col mb-4'>
        {
          isWeb3Enabled ?
            (

              <div className='w-1/3 ring-2 ring-gray-400 m-3 rounded-md details-div flex flex-col self-center'>
                <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Marketplace Proceedings</h6>
                <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Total Amount <i className='text-green-600 text-lg'>{bal && ethers.utils.formatUnits(bal, "ether")} ETH</i></h6>
                { bal > 0 &&
                  <button onClick={withdraw} className="bg-green-500 py-1 w-44 h-10 self-center rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-green-600" disabled={isLoading}>
                  Withdraw Proceeds
                </button>
                } 
              </div>


            )
            : ""
        }
      </div>

    </div>
  )
}

export default BuyTokens
