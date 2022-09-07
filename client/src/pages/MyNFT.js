import React, { useEffect, useState } from 'react'
import Moralis from 'moralis-v1'
import NFTBox from '../components/NFTBox'
import { useMoralis } from 'react-moralis'


const MyNFT = () => {
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
  }, [isConnected, account])



  return (
    <div className='container mx-auto'>
      <h1 className='py-4 px-4 font-bold text-2xl'>MY NFTs</h1>
      <div className='flex flex-wrap'>
        {data.length !== 0 ? (
          isWeb3Enabled ?
            (

              loading ? (<div>Loading......</div>) :
                (
                  data.map((nft) => {

                    const { price, nftAddress, tokenId, marketplaceAddress, seller } = nft.attributes
                    return (
                      <div className='m-10'>
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
            )
            :
            <div>Web3 Currently Not Enabled</div>
        ) : "No NFT Available"


        }
      </div>
    </div>
  )
}

export default MyNFT