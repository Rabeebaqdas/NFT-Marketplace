import React from 'react'
import nft_gif from "../imgs/nft-gif.gif";
import News from '../components/NewsHomePage';
import TrendingCards from '../components/TrendingCards';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
    <div className="shadow-none w-full h-80 bg-gradient-to-b from-blue-200 to-transparent flex justify-around flex-wrap items-center">
        <div className="h-full lg:w-2/3 lg:px-16 md:w-3/5 md:px-8 sm:px-4 sm:w-3/5 xs:w-2/5 flex items-center whitespace-pre-line">
          <p className="font-bold break-words whitespace-pre-line lg:text-5xl md:text-3xl sm:text-3xl ">
            Discover, Create and Sell{" "}
            <p className="text-red-500">Wonderful NFTs</p>
            <p className="xl:text-xl lg:text-lg md:pt-8 md:w-auto break-words font-medium md:text-lg sm:text-base xs:text-xs xs:w-2/3 xs:pt-2">
              {" "}
              We Provide You With A Plethora Of Thrilling NFT Art
            </p>
            <Link to="/explore">
            <button className="py-0.5 px-1 md:text-lg font-medium rounded-md ring ring-2 ring-red-500 bg-red-500 text-gray-100 hover:bg-red-600 xs:ml-4 xs:mt-4 xs:text-sm sm:ml-24 sm:text-base md:ml-28 lg:ml-48 lg:text-lg lg:py-1 lg:px-2">
              Explore
            </button>
            </Link>
          </p>
        </div>
        <div className="h-full lg:w-1/3 lg:px-16 md:w-2/5 md:px-8 sm:w-2/5 xs:w-2/5 flex items-center">
          <img
            className="rounded-xl shrink-1 lg:h-64 lg:w-64 md:h-64 md:w-64 sm:h-64 sm:w-64"
            src={nft_gif}
          />
        </div>
      </div>
      <News/>
      <TrendingCards/>
    </>
  )
}

export default Home
