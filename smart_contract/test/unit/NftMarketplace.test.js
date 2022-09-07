const { assert, expect } = require("chai");
const { network, deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name) ? describe.skip : describe("Nft Marketplace Tests", function () {
    let nftMarketplace, basicNft, deployer, player,owner;
    const PRICE = ethers.utils.parseEther("0.1")
    const TOKEN_ID = 0;
    beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        // player = (await getNamedAccounts()).player;
        const account = await ethers.getSigners()
        player = account[1];
        owner = account[0]; //for withdraw function test
        await deployments.fixture(["all"])

        nftMarketplace = await ethers.getContract("NftMarketplace") //it will take the deployer account by default we dont need to write like this ("NftMarketplace",deployer)
        //const diffAccount = await nftMarketplace.connect(player) // for changing the account we can also write like this ("NftMarketplace",player)
        basicNft = await ethers.getContract("BasicNft")
        await basicNft.mintNft();
         await basicNft.approve(nftMarketplace.address, TOKEN_ID)
      
    })

    // it("lists and can be bought", async () => {
    //     await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
    //     const buyer = nftMarketplace.connect(player);
    //     await buyer.buyItems(basicNft.address, TOKEN_ID, {
    //         value: PRICE
    //     });
    //     const newOwner = await basicNft.ownerOf(TOKEN_ID);
    //     const proceeds = await nftMarketplace.getProceeds(deployer);
    //     assert(newOwner.toString() == player.address);
    //     assert(proceeds.toString() == PRICE.toString());
    // })

    describe("listItem",() => {
        it("emits an event after listing an item", async () => {
           expect(await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit("ItemListed")
        })
        it("exclusively items that haven't been listed",async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
              const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`  //format will be as described in the contract spaces after comma matters 
         await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWith(error)
        })
        it("exclusively allows owners to list",async () => {
           const random = nftMarketplace.connect(player)
            await expect(
                random.listItem(basicNft.address, TOKEN_ID, PRICE)
            ).to.be.revertedWith("NotOwner")
        })
        it("needs approvals to list item",async () => {
            await basicNft.approve(ethers.constants.AddressZero,TOKEN_ID);
            await expect(nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.be.revertedWith("NotApprovedForMarketplace")
        })
        it("Updates listing with seller and price",async () => {
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            const listing = await nftMarketplace.getListing(basicNft.address,TOKEN_ID)
            assert(listing.price.toString() == PRICE.toString())
            assert(listing.seller.toString() == deployer)
        })
        
    })

    describe("cancelListing", () => {
        it("reverts if there is no listing" , async () => {
            const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`
            await expect(nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)).to.be.revertedWith(error)
        })
        it("reverts if anyone but the owner tries to call",async () =>{
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            const random = nftMarketplace.connect(player)
            await expect(random.cancelListing(basicNft.address,TOKEN_ID)).to.be.revertedWith("NotOwner") 
        })

        it("emits event and removes listing",async()=>{
            await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
            expect(await nftMarketplace.cancelListing(basicNft.address,TOKEN_ID)).to.emit("ItemCanceled")
            const listing = await nftMarketplace.getListing(basicNft.address,TOKEN_ID)
            assert(listing.price.toString() == 0)
        })

    })
    describe("buyItem",()=>{
        it("reverts if the item isnt listed",async () => {
            await expect(nftMarketplace.buyItems(basicNft.address,TOKEN_ID)).to.be.revertedWith("NotListed")
        })
        it("reverts if the price isnt met",async () =>{
            await nftMarketplace.listItem(basicNft.address,TOKEN_ID,PRICE)
            await expect(nftMarketplace.buyItems(basicNft.address,TOKEN_ID)).to.be.revertedWith("PriceNotMet")
        })
        it("transfers the nft to the buyer and updates internal proceeds record",async () => {
            await nftMarketplace.listItem(basicNft.address,TOKEN_ID,PRICE)
            const random = nftMarketplace.connect(player)
            expect(await random.buyItems(basicNft.address,TOKEN_ID,{value : PRICE})).to.emit("ItemBought")
            const newOwner = await basicNft.ownerOf(TOKEN_ID)
            const proceed = await nftMarketplace.getProceeds(deployer)
            assert(newOwner.toString() == player.address)
            assert(proceed.toString() == PRICE.toString())
        })
    })

    describe("updateListing",()=>{
        it("must be owner and listed", async () => {
            await expect(nftMarketplace.updateListing(basicNft.address,TOKEN_ID,PRICE)).to.be.revertedWith("NotListed")
            await nftMarketplace.listItem(basicNft.address,TOKEN_ID,PRICE)
            const random = nftMarketplace.connect(player)
            await expect(random.updateListing(basicNft.address,TOKEN_ID,PRICE)).to.be.revertedWith("NotOwner")
        })
        it("updates the price of the item",async() => {
            const updatedPrice = ethers.utils.parseEther("0.2")
            await nftMarketplace.listItem(basicNft.address,TOKEN_ID,PRICE)
            expect(await nftMarketplace.updateListing(basicNft.address,TOKEN_ID,updatedPrice)).to.emit("ItemListed")
            const listing = await nftMarketplace.getListing(basicNft.address,TOKEN_ID)
            assert(listing.price.toString() == updatedPrice.toString())

        })
    })

    describe("withdrawProceedss", () => {
        it("withdraws proceeds",async () => {
            await nftMarketplace.listItem(basicNft.address,TOKEN_ID,PRICE)
            const random = nftMarketplace.connect(player)
            await random.buyItems(basicNft.address,TOKEN_ID,{value : PRICE})
            const Owner = nftMarketplace.connect(owner)
            const proceedsBefore = await Owner.getProceeds(owner.address)
            const ownerBalanceBefore = await owner.getBalance()
            const tx = await Owner.withdrawProceeds()
            const response = await tx.wait(1)
            const {gasUsed, effectiveGasPrice} = response
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const ownerBalanceAfter = await owner.getBalance()
            assert(ownerBalanceAfter.add(gasCost).toString() == proceedsBefore.add(ownerBalanceBefore).toString())  


        })
    })

})   