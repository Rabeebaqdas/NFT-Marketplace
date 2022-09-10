import React from "react";
import img1 from "../imgs/nft-img1.jpg";
import img2 from "../imgs/nft-img2.jpg";
import img3 from "../imgs/nft-img3.jpg";
import "../pages/styles.css";

const News = () => {
  const newsData = [
    {
      title: "Is NFT The Future?",
      desc: "Nft is termed as the art of the future. Find out more in our exclusive blog...",
      image: img1,
    },

    {
      title: "Is NFT Worth It?",
      desc: "Are NFTs worth the hefty price tag that are attached to them? Find out more in our exclusive blog...",
      image: img2,
    },

    {
      title: "NFT Sold For $69 Million",
      desc: "This might look like a Pixelated NFT but it has been sold for $69 Million. find out how...",
      image: img3,
    },
  ];

  return (
    <>
      <div className="shadow-none gradient-css-div ">
        <h1 className="text-center lg:py-20 md:py-12 sm:py-6 xs:py-6 font-extrabold lg:text-4xl md:text-3xl sm:text-2xl xs:text-xl text-red-500 underline decoration-4 underline-offset-8">
          News From The NFT World
        </h1>
        <div className="flex sm:flex-row xs:flex-col sm:justify-center xs:items-center sm:h-80">
          {newsData.map((e) => (
            <div
              style={{ backgroundImage: `url(${e.image})` }}
              className="hover:shadow-2xl hover:shadow-black lg:mx-16 md:mx-8 sm:mx-4 rounded bg-div lg:h-full lg:w-5/6 md:h-5/6 md:w-3/4 sm:h-3/4 sm:w-2/3 xs:h-64 xs:w-2/4 xs:my-4 bg-cover bg-center bg-no-repeat flex flex-col justify-end bg-gradient-to-b from-black-100 to-transparent "
            >
              <div className="desc-div rounded-t-md rounded-b-md drop-shadow-2xl px-3">
                <h1 className="font-black text-red-500 text-lg mb-2 ">
                  {e.title}
                </h1>
                <p className="text-white font-thin">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
        </div>
      </div>
    </>
  );
};

export default News;