import React, { useEffect, useState } from 'react'
import Moralis from 'moralis-v1'
import { useMoralis } from 'react-moralis'
import NFTBox2 from '../components/NFTBox2'
import NotMinted from "../imgs/NotMinted.svg";
import web3 from "../imgs/web3.svg";


const NotListedNFT = () => {
  const [isConnected, setIsConnected] = useState()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { isWeb3Enabled, account } = useMoralis()

  

  useEffect(() => {
    setIsConnected(Moralis.start({ serverUrl: process.env.REACT_APP_SERVER_URL, appId: process.env.REACT_APP_APP_ID }))
  }, [])

  useEffect(() => {

    const get = async () => {

      try {
        if (isConnected) {
          const query = await new Moralis.Query("NFTMinted").ascending("tokenId").equalTo("owner", account).find()
          setData(query)
          console.log("query", query)

          setLoading(false)
        }
      } catch (err) {
        console.log(err)
      }
    }
    get()
  }, [isConnected, account, isWeb3Enabled])


  return (
    <div className='w-full gradient-css-div-explore'>
    <h1 className='py-4 px-4 font-bold text-2xl'>Not Listed</h1>
    {
      isWeb3Enabled ? (
        <div className='flex flex-wrap'>
      {data.length !== 0 ?
        (
    

              loading ? (<div ><p className='font-bold text-lg'>Loading......</p></div>) :
                (
                  data.map((nft) => {

                    const { nftAddress, tokenId, owner } = nft.attributes
                    return (
                      <div className='mx-12'>
                       
                          <NFTBox2
                            nftAddress={nftAddress}
                            tokenId={tokenId}
                            owner={owner}
                            key={`${nftAddress} ${tokenId}`}
                          />
                      </div>
                    )

                  })
                )
           
        ) : 
        <>
                     <div className="flex py-10 flex-col w-full h-full gradient-css-div-noneFound">
                     <img src={NotMinted} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
                     <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">No NFT Minted yet!</p>
             </div>
              </>

      }


    </div>
      ) : 
       <>
      <div className="flex py-10 flex-col w-full h-full">
      <img src={web3} alt="nothing listed" className="self-center w-1/2 h-1/2" ></img>
      <p className="self-center font-semibold mt-10 mb-5 text-gray-700 tracking-wide mx-3 lg:text-lg md: text-normal sm:text-md">Oops! looks like Web3 Conenction failed</p>
</div>
</>
    }
    
   
  </div>
  )
}

export default NotListedNFT

