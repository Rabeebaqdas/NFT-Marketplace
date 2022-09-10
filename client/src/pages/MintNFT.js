import React, { useEffect, useRef, useState } from 'react'
import { uploadFileToIPFS, uploadJSONToIPFS } from '../pinata';
import { useWeb3Contract, useMoralis } from 'react-moralis'
import nftAbi from '../constants/basicNft.json'
import networkMapping from "../constants/networkMapping.json"
import tokenAbi from '../constants/marketplaceToken.json';
import ParticlesBg from 'particles-bg'
import siteLogo from '../imgs/site-logo2.png'
import './styles.css'
import { useNotification } from 'web3uikit'
import web3 from "../imgs/web3.svg";

const MintNFT = () => {
    const inputRef = useRef(null)
    const [formParams, updateFormParams] = useState({
        name: '',
        description: '',
        attributes: [
            {
                trait_type: "Cuteness",
                value: "100"
            }
        ]
    })
    let width = window.innerWidth;
    const [fileURL, setFileURL] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, updateMessage] = useState('');

    const [feesForMinting, setFeesForMinting] = useState();

    const { runContractFunction, isLoading } = useWeb3Contract()
    const { isWeb3Enabled, chainId, account } = useMoralis()
    const chainIdString = chainId ? parseInt(chainId).toString() : "31337"
    const nftAddress = networkMapping[chainIdString].BasicNft[0]
  const tokenAddress = networkMapping[chainIdString].MyToken[0]  

    const dispatch = useNotification()
   
    const uploadImg = async (e) => {
        let file = e.target.files[0]

        try {
            setLoading(true)
            updateMessage("Uploading image to IPFS....")
            const option2 = {
                abi:tokenAbi,
                contractAddress:tokenAddress,
                functionName:"balanceOf",
                params: {
                    user: account
                }
            }
          const check =   await runContractFunction({
                params: option2
            })
                 if(check.toString() >= feesForMinting) {
                    const response = await uploadFileToIPFS(file)
                    if (response.success === true) {
                        console.log("Uploaded image to pinata", response.pinataURL)
                        setFileURL(response.pinataURL)
                        updateMessage("Image uploaded successfully!")
                        setLoading(false)
                    }else{
                        console.log("Error")
                    }
                 }
                 else {
                    updateMessage("You dont have enough tokens");
                    updateFormParams({ name: '', description: '', royalityFee: '' });
                    inputRef.current.value = null
                    setLoading(false)
                }
    
        

        } catch (err) {
            console.log("Error during file upload", err)
            setLoading(false)

        }
    }

    const uploadMetaDataToIPFS = async () => {
        const { name, description, royalityFee, attributes } = formParams
        if (!name || !description || !royalityFee || !fileURL) {
            return;
        }
        const nftJSON = {
            name, description, royalityFee, image: fileURL, attributes:attributes
        }
        try {
            const response = await uploadJSONToIPFS(nftJSON)
            if (response.success === true) {
                console.log("upload JSON to pinata:", response.pinataURL)
                return response.pinataURL
            }
        } catch (err) {
            console.log("Error uplaoding JSON metaData:", err)
        }
    }

    const tokensRequriedForNFTMinting = async() => {
        const options= {
            abi:tokenAbi,
            contractAddress:tokenAddress,
            functionName:"tokensRequriedForNFTMinting",
            params: {}
        }

      const supply = await runContractFunction({
            params: options
        })
        setFeesForMinting(supply.toString())
    }



    const approvalForTokens = async(e) => {
        e.preventDefault();
        
        setLoading(true)
        try{
            updateMessage("Approving Tokens...")
                const options = {
                    abi:tokenAbi,
                    contractAddress:tokenAddress,
                    functionName:"approval",
                    params: {
                        _spender: nftAddress,
                        _value: feesForMinting
                    }
                }
        
                await runContractFunction({
                    params: options,
                    onSuccess: mintNFT,
                    onError: (err) => console.log(err)
                })
                updateMessage("Tokens Approved to marketplace!")
             
        

            
            
        }catch(err) {
            updateMessage("")
        }
        

    }

    const mintNFT = async () => {
      
        setLoading(true)
        updateMessage("Uploading metaData to IPFS...")
        const metadata = await uploadMetaDataToIPFS()
        console.log("done ", metadata)
        updateMessage("Metadata uploaded successfully!")
        
        try {
            const mintOptions = {
                abi: nftAbi,
                contractAddress: nftAddress,
                functionName: "mintNft",
                params: {
                    _tokenURI: metadata,
                    _noOfBips: formParams.royalityFee,
                    _token: tokenAddress
                }
            }

            await runContractFunction({
                params: mintOptions,
                onSuccess: mintingSuccess,
                onError: mintingError
            })

            setLoading(false)
            
            updateFormParams({ name: '', description: '', royalityFee: '' });
            inputRef.current.value = null
           

        } catch (err) {
            console.log("Something went wrong ", err)
            updateMessage("");
            setLoading(false)
        }
    }

    const mintingSuccess = async (tx) => {
        await tx.wait(1)
        updateMessage("NFT has been Minted!");
        dispatch({
            type: "success",
            title: "Minting Success",
            message: "NFT has been minted",
            position: "topR"
        })
        setTimeout(() => window.location.replace("/notlistednft"), 5000)
    }

    const mintingError = () => {
        updateMessage("Minting failed due to some reason");
        dispatch({
            type: "error",
            title: "Minting Failed",
            message: "MetaMask Tx Signature: User denied transaction signature.",
            position: "topR"
        })
    }


    useEffect(()=>{
        tokensRequriedForNFTMinting()
    },[chainId])

    return (

      
        <div className="">
            {
                isWeb3Enabled ?
                    (
                        <>

                            {
                                width && width < 768 ? (
                                    <ParticlesBg type="cobweb" num={35} color="#2eb38b" bg={true}></ParticlesBg>
                                )
                                    : (
                                        <ParticlesBg type="cobweb" color="#2eb38b" bg={true}></ParticlesBg>
                                    )
                            }
                            <div className='flex justify-center items-center h-screen mt-10 mb-10'>

                                <div className='login-div2 flex flex-col justify-center items-center h-auto w-1/3 rounded-lg bg-gradient-to-br from-teal-300 to-green-100'>
                                    <img alt='Nft Gate' src={siteLogo} className='p-3'></img>
                                    <h3 className="text-center font-bold text-indigo-900 mb-3">Upload your NFT to the marketplace</h3>
                                    <form className='flex flex-col justify-center items-center h-auto w-1/1 rounded-lg' onSubmit={approvalForTokens}>
                                        <input className='my-3.5 rounded p-2 w-3/4 focus:outline-0 ' type="text" name="nftName" id="nftName" placeholder='NFT Name' onChange={e => updateFormParams({ ...formParams, name: e.target.value })} value={formParams.name} disabled={loading || isLoading} required />
                                        <textarea className='my-3.5 rounded p-2 w-3/4 focus:outline-0 ' type="text" name="NftDesc" id="NftDesc" placeholder='Nft Description' value={formParams.description} onChange={e => updateFormParams({ ...formParams, description: e.target.value })} disabled={loading || isLoading} required />
                                        <input className='my-3.5 rounded p-2 w-3/4 b focus:outline-0' type="number" name="royaltyFee" id="royaltyFee" placeholder='Royalty Fee in terms of Bips' min="0" max="1000" onChange={e => updateFormParams({ ...formParams, royalityFee: e.target.value })} value={formParams.royalityFee} disabled={loading || isLoading} required />
                                        <input ref={inputRef} className='my-3.5 rounded p-2 w-3/4 b focus:outline-0' type="file" name="nftImg" id="nftImg" onChange={uploadImg} required />
                                        <div className="text-green-900 text-center">{message}</div>
                                        <button type="submit" className='my-5 cursor-pointer ring ring-2 ring-teal-300 shadow-2xl shadow-black bg-teal-300 text-gray-100 hover:bg-teal-400 hover:ring-teal-400 rounded py-0.5 px-1 font-bold w-24 text-lg' disabled={loading || isLoading}>Mint NFT</button>
                                    </form>
                                </div>
                            </div>

                        </>
                    )
                    :
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

export default MintNFT




