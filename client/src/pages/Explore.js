import React, { useEffect, useState } from 'react'
import Moralis from 'moralis-v1'
import NFTBox from '../components/NFTBox'
import { useMoralis } from 'react-moralis'
import explore from "../imgs/explore.svg";
import web3 from "../imgs/web3.svg";



const Explore = () => {
  const [isConnected, setIsConnected] = useState()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  
  const {isWeb3Enabled,account} = useMoralis()

  useEffect(() => {
    setIsConnected(Moralis.start({ serverUrl: process.env.REACT_APP_SERVER_URL, appId: process.env.REACT_APP_APP_ID }))
  }, [])

  useEffect(() => {

    const get = async () => {

      try {
        if (isConnected) {
          const query = await new Moralis.Query("ActiveItem").ascending("tokenId").notEqualTo("seller",account).find()
          setData(query)
          console.log(query)
       
          setLoading(false)
        }
      } catch (err) {
        console.log(err)
      }
    }
    get()
  }, [isConnected,account,isWeb3Enabled])



  return (

 <div className='mx-auto gradient-css-div-explore'>
      <h1 className='py-4 px-4 font-bold text-2xl'>Recently Listed</h1>
      {
        isWeb3Enabled ? (
          <div className='flex flex-wrap'>
          { data.length !==0 ? (
    
          loading ? (<div>Loading......</div>) :
            ( 
              data.map((nft) => {
    
                const { price, nftAddress, tokenId, marketplaceAddress, seller } = nft.attributes
                return (
                  <div className='mx-12'>
                  <NFTBox 
                  price = {price}
                  nftAddress = {nftAddress}
                  tokenId = {tokenId}
                  marketplaceAddress = {marketplaceAddress}
                  seller = {seller}
                  key = {`${nftAddress} ${tokenId}`}
                  />
                  </div>
                )
    
              })
            )
            
          ) :  <>
          <div className="flex py-10 flex-col w-full h-full  gradient-css-div-noneFound">
          <img src={explore} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
          <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">We're sure you're eager and excited to explore limitless NFT art but sadly no listings have been made as of yet</p>
    </div>
    </>
         
          }
    </div>
        ) :  <>
        <div className="flex py-10 flex-col w-full h-full">
        <img src={web3} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
        <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">Oops! looks like Web3 Conenction failed</p>
</div>
 </>
      }
    </div>
  )
}

export default Explore

