import React from "react";
import img1 from "../imgs/trending-nft1.png";
import img2 from "../imgs/trending-nft2.png";
import img3 from "../imgs/trending-nft3.png";
import "../pages/styles.css";

const TrendingCards = () => {
  const nfts = [
    {
      title: "Fat Penguin #2132",
      creator: "Penguin Nfts Collection",
      image: img1,
      price: "120.0",
    },
    {
      title: "Capped Skull #251",
      creator: "Skull Collection",
      image: img2,
      price: "50.0",
    },
    {
      title: "Scholar Owl #3452",
      creator: "Owl Moods Collection",
      image: img3,
      price: "250.0",
    },
  ];

  return (
    <div className="gradient-css-div-2">
      <h1 className="text-center lg:py-20 md:py-12 sm:py-6 xs:py-6 font-extrabold lg:text-4xl md:text-3xl sm:text-2xl xs:text-xl text-red-500 underline decoration-4 underline-offset-8">
        Trending NFTs
      </h1>
      <div className="flex justify-center flex-wrap ">
        {nfts.map((item) => (
          <div className="shrink-0 rounded-lg border border-solid border-black bg-white max-w-sm hover:shadow-2xl hover:shadow-balck lg:my-8 lg:mx-16 md:mx-8 md:my-6 sm:mx-4 sm:my-4 xs:mx-4 xs:my-4">
            <a href="#!">
              <img className="rounded-t-lg" src={item.image} alt={item.title} />
            </a>
            <div className="p-6">
              <div className="flex flex-row justify-between">
                <p className="text-gray-500 text-sm font-medium mb-4">
                  {item.creator}
                </p>
                <p className="text-gray-500 text-sm font-medium mb-4">Price</p>
              </div>
              <div className="flex flex-row justify-between">
                <p className="text-gray-800 break-words text-sm font-bold ">{item.title}</p>
                <p className="text-gray-800 break-words text-sm font-bold ">
                  <svg className="inline w-3.5 h-3.5 mb-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                    <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                  </svg>
                 {item.price}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        </div>
      <br />
    </div>
  );
};

export default TrendingCards;