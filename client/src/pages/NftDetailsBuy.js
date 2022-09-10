import React, { useState, useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import { IoWalletOutline } from 'react-icons/io5'
import { FaChessKing } from 'react-icons/fa'
import { prominent } from 'color.js'
import './styles.css'
import { ethers } from 'ethers'
import axios from 'axios'
import CanvasJSReact from '../canvasjs.react';
import { useWeb3Contract } from "react-moralis";
import { useNotification } from "web3uikit";
import nftMarketplaceAbi from "../constants/Nftmarketplace.json"

const NftDetailsBuy = () => {
    var CanvasJS = CanvasJSReact.CanvasJS;
    var CanvasJSChart = CanvasJSReact.CanvasJSChart;
    const location = useLocation()
    const data = location.state
    console.log(data);
    const [color, setColor] = useState([]);
    const [dominant, setDominant] = useState()
    const [response, setResponse] = useState();
    const today = new Date()
    const priorDate = new Date(new Date().setDate(today.getDate() - 30));
    const startDateApi = priorDate.getFullYear() + "-" + (priorDate.getMonth() + 1) + "-" + priorDate.getDate()
    let arr = []
    const isFirstRender = useRef(true);
    const dispatch = useNotification()

    const options = {
        animationEnabled: true,
        exportEnabled: true,
        theme: "light2", // "light1", "dark1", "dark2"
        title: {
            text: "ETH Value For The Past 30 Days (In USD)"
        },
        axisY: {
            title: "Price",
            suffix: "$"
        },
        axisX: {
            title: "Date",
            prefix: "",
            interval: 1
        },
        data: [{
            type: "line",
            toolTipContent: "{x}: {y} $",
            dataPoints: arr
        }]
    }

    const fetchData = async () => {
        const res = await axios("https://data.messari.io/api/v1/assets/ethereum/metrics/price/time-series?start=" + startDateApi + "&interval=1d")
        setResponse(res)
    }

    const getColorPallete = () => {
        prominent(data.nftImage, { amount: 3, format: 'hex' }).then(clr => {
            setColor(clr);
        })

        prominent(data.nftImage, { amount: 1, format: 'hex' }).then(clr => {
            setDominant(clr + "65");
        })
    }
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {

        getColorPallete()

    }, [data?.nftImage]);

    useMemo(() => {
        response && response.data.data.values.map((e) => {
            const date = new Date(e[0])
            const usdRounded = Math.round(e[4] * 100) / 100;
            arr.push({ x: date, y: usdRounded });
        })

    }, [response])

    const {runContractFunction: buyItems ,isLoading} = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: data.marketplaceAddress,
        functionName: "buyItems",
        msgValue: data.nftPrice,
        params: {
            nftAddress : data.nftAddress,
            tokenId : data.tokenId
        }
    })

    const buy = () => {
        buyItems({
            onSuccess: buyingSuccess,
            onError: buyingError
        })
    }
    
const buyingSuccess = async(tx) => {
    await tx.wait(1)
    dispatch({
        type: "success",
        title: "Item Bought",
        message: "Item bought - please refresh (and move blocks) ",
        position: "topR"
    })
    setTimeout(() => window.location.replace("/notlistednft"), 5000)
}

const buyingError = () => {
    dispatch({
        type: "error",
        title: "Transaction Failed",
        message: "Buying canceled - you have rejected the transaction",
        position: "topR"
    })
}

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
                        <p className="text-md font-medium text-gray-500"><FaChessKing className='inline mb-1' /> Royalty Fee {`${((data.royalityFee / 10000) * 100).toFixed(1)}%`}</p>
                        <p className="py-5 text-4xl font-bold">{data.nftName}</p>
                        <p className="text-md font-medium text-gray-500">Owned By {data.owner}</p>
                        <p className="py-5 text-4xl font-bold"><svg
                            className="inline w-6 h-6 mb-1.5 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                        >
                            <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                        </svg>{ethers.utils.formatUnits(data.nftPrice, "ether")}</p>
                        <p className="py-5 text-2xl font-bold text-gray-600">Description:</p>
                        <p className=" pb-5 text-lg font-bold text-gray-400">{data.desc}</p>
                        <button className="bg-cyan-500 py-1 w-40 h-10 rounded-lg mb-4 mt-2 text-lg font-semibold text-white hover:bg-cyan-600" onClick={buy} disabled={isLoading}>
                            <IoWalletOutline color="white" className="inline w-6 h-6 mr-2 mb-1" />
                            Buy Now
                        </button>
                    </div>

                    <div className="mt-5 p-1 rounded-lg bg-zinc-800 ">
                        <CanvasJSChart options={options} />
                    </div>
                </div>
            </div>
            <br></br>
            <hr></hr>
        </div>
    )
}

export default NftDetailsBuy