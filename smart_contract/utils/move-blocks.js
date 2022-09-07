const {network} = require("hardhat")

const sleep = (timeInMs) => {
   return new Promise((resolve)=>setTimeout(resolve,timeInMs))
}

const moveBlocks = async (amount , sleepAmount = 0) => {
    console.log("Moving Blocks........")
    for(let i = 0 ; i < amount ; i++) {
        await network.provider.request({
            method: "evm_mine",
            params: []
        })
        if(sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}`);
            await sleep(sleepAmount);
        } 
    }
}

module.exports = {
    moveBlocks,
    sleep
}