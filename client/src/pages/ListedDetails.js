import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MdOutlineUpdate } from 'react-icons/md'
import { ImCancelCircle } from 'react-icons/im'
import { FaChessKing } from 'react-icons/fa'
import { prominent } from 'color.js'
import './styles.css'
import { ethers } from 'ethers'
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"
import { useNotification } from "web3uikit";
import { useMoralis, useWeb3Contract } from "react-moralis";
import networkMapping from "../constants/networkMapping.json"
import UpdateListingModal from "../components/UpdateListingModal"


const ListedDetails = () => {
    const location = useLocation()
    const data = location.state
    console.log(data);
    const [color, setColor] = useState([]);
    const [dominant, setDominant] = useState()
    const [showModal, setShoModal] = useState(false)
    const {runContractFunction, isLoading} = useWeb3Contract()
    const { chainId } = useMoralis()
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

    const cancelListedNFT = async (e) => {
        e.preventDefault()
        const nftAddress = data.nftAddress
        const tokenId = data.tokenId
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
        setTimeout(()=>window.location.replace("/notlistednft"), 5000) 
    
      }

      const handleCardClick = () => {
      setShoModal(true)
    }


    const closeModal = () => {
        setShoModal(false)
       }


    useEffect(() => {

        getColorPallete()

    }, [data?.nftImage]);

    return (
        <div className="h-full rounded-br-xl" style={{ backgroundImage: `linear-gradient(to top right, #90cef400,#90cef400,${dominant}, #90cef400, #90cef400)` }}>
                 <UpdateListingModal isVisible={showModal} onClose={closeModal} marketplaceAddress={marketplaceAddress} tokenId={data.tokenId} nftAddress={data.nftAddress} price={data.nftPrice} />
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
                        <p className="text-md font-medium text-gray-500"><FaChessKing className='inline mb-1' /> Royalty Fee {`${(data.royalityFee / 10000) * 100}%`}</p>
                        <p className="py-5 text-4xl font-bold">{data.nftName}</p>
                        <p className="py-5 text-4xl font-bold"><svg
                            className="inline w-6 h-6 mb-1.5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                        >
                            <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                        </svg>{ethers.utils.formatUnits(data.nftPrice, "ether")}</p>
                        <p className="py-5 text-2xl font-bold text-gray-600">Description:</p>
                        <p className=" pb-5 text-lg font-bold text-gray-400">{data.desc}</p>
                        <button className="bg-cyan-500 py-1 w-40 h-10 rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-cyan-600" onClick={handleCardClick}>
                            <MdOutlineUpdate color="white" className="inline w-6 h-6 mr-2 mb-1" />
                            Update Listing
                        </button>
                    </div>

                    <div className=" px-4 py-2 rounded-md border border-gray-400 details-div my-5">
                        <p className="text-2xl text-red-600 font-bold">Cancel Listing:</p>
                        <form className="flex flex-col" onSubmit={cancelListedNFT}>
                            <input className='bg-gray-300 my-3.5 rounded-lg p-2 w-1/2 ring-1 ring-gray-400 focus:outline-0' type="text" name="contractAddress" id="contractAddress" placeholder='0x0729162903610E279Sd7207' required readOnly />
                            <input className='bg-gray-300 my-3.5 rounded-lg p-2 w-1/2 ring-1 ring-gray-400 focus:outline-0' type="number" name="tokenId" id="tokenId" placeholder={data.tokenId} required readOnly />
                            <button type="submit" className="bg-red-600 py-1 w-40 h-10 rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-red-700" disabled={isLoading}>
                                <ImCancelCircle className="inline w-6 h-6 mr-2 mb-1" />
                                Cancel Listing
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

export default ListedDetails