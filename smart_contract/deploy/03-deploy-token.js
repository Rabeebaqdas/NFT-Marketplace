const {network} = require("hardhat");
const {developmentChains} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async({getNamedAccounts, deployments}) => {
    const {deploy,log} = deployments;
    const {deployer} = await getNamedAccounts();
    const args = [];

    const token = await deploy("MyToken", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...................")
        await verify(token.address, args);
    }
    log("---------------------------------------")
}