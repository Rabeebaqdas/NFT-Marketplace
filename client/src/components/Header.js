import React from 'react'
import { Link } from 'react-router-dom';
import { ConnectButton } from "web3uikit"
const Header = () => {

  return (
    <nav className="p-5 border-b-2 flex flex-row justify-between items-center">
      <h1 className="py-4 px-4 font-bold text-1xl">NFT Marketplace</h1>
      <div className="flex flex-row items-center">
        <Link to="/">
        <a className="mr-2 p-1">Home</a>  
        </Link>
        <Link to="/listnft">
        <a className="mr-2 p-6">List NFT</a>  
        </Link>
        <Link to="/mynft">
        <a className="mr-2 p-6">My NFT</a>  
        </Link>
        <Link to="/mintednft">
        <a className="mr-2 p-6">Minted NFT</a>  
        </Link>
        <Link to="/mintnft">
        <a className="mr-2 p-6">Mint NFT</a>  
        </Link>
        <Link to="/buytokens">
        <a className="mr-2 p-6">Buy Tokens</a>  
        </Link>
        <ConnectButton moralisAuth={false} />
      </div>
    </nav>

  )
}

export default Header