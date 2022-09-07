
const { moveBlocks } = require("../utils/move-blocks")

const BLOCK = 2
const SLEEP_BLOCK = 1000

const mine = async () => {
   await moveBlocks(BLOCK, (sleepAmount = SLEEP_BLOCK))
    console.log("Mining Done........")
}
const main = async () => {
    try {
        await mine()
        process.exit(0)
    } catch (err) {
        console.log(err)
        process.exit(1)
    }
}

main()