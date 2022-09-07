import React, { useEffect, useState } from 'react'
import { useMoralis, useWeb3Contract } from 'react-moralis'
import { Button, Form, useNotification } from 'web3uikit'
import { ethers } from "ethers"
import networkMapping from "../constants/networkMapping.json"
import tokenAbi from '../constants/marketplaceToken.json';
const BuyTokens = () => {
  const {runContractFunction, isLoading} = useWeb3Contract()
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const [totalSupply, setSupply] = useState()
    const [remaining, setRemainingTokens] = useState()
    const [price, setPrice] = useState()
    const [owner, setowner] = useState()


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
    const ownerofContract =  await runContractFunction({
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

    const buy = async(data) => {
      const tokens = data.data[0].inputResult
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
     Owner()
     totalAmount()

  },[account,chainId])



    
 

  return (
    <div className='container mx-auto'>
      <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Total Supply: <i className='text-green-600 text-md'>{totalSupply} DC</i></h6>
      <h6 className='py-4 px-4 font-bold text-2xl mb-2'>Available Tokens: <i className='text-red-600 text-md'>{remaining} DC</i></h6>
      <h6 className='py-4 px-4 font-bold text-1xl mb-2'>Dex Coin Address: <i className='text-green-600 text-sm'>{tokenAddress}</i></h6> 

    <div>
         {isWeb3Enabled ?
        <Form
        onSubmit={buy}
          data={[
            {
              name: "Number of Tokens to want to buy",
              type: "number",
              value: "",
              inputWidth: "50%",
              key: "tokenId"
            }
          ]}
          title="Buy Dex Coin For minting NFT!"
          id='Main Form'
           isDisabled={isLoading}
        /> : "Web3 Currently Not Enabled"}
     
        <div>
{
    isWeb3Enabled  ? 
    (

        <div className='ml-5'>
                   <div className='border-b-2 my-5'></div>
                   <h1 className='py-4 px-4 font-bold text-2xl'>Withdraw Amount!</h1>
                   <h6 className='py-4 px-4 font-bold text-1xl mb-2'>Total Amount: <i className='text-green-600 text-lg'>{ bal && ethers.utils.formatUnits(bal, "ether")} ETH</i></h6>
         
      <Button size='large' text='Withdraw Proceeds' color='green' theme='colored' isFullWidth="true" onClick={withdraw} disabled={isLoading} />

                </div>


    )
    : ""
}
        </div>
    </div>
    </div>

  )
}

export default BuyTokens