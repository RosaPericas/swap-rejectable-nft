import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";
import chai from "chai";
import { Contract } from "ethers";

const { expect } = chai;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const NFT_NAME = "NFT test";
const NFT_SYMBOL = "NFT1";
const RejNFT_NAME = "Rejectable NFT test";
const RejNFT_SYMBOL = "RejNFT1";
const ExNFT_NAME = "Exchangeable NFT test";
const ExNFT_SYMBOL = "ExNFT1";

describe("ExchangeableRNFT", () => {
  let nft: Contract;
  let rejectableNFT: Contract;
  let exchangeableNFT: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // deploy NFT
    /* const NFT = await ethers.getContractFactory("ERC721");
    nft = await NFT.deploy(NFT_NAME, NFT_SYMBOL);
    await nft.deployed();

    // deploy RejectableNFT
    const RejectableNFT = await ethers.getContractFactory("RejNFT");
    rejectableNFT = await RejectableNFT.deploy(RejNFT_NAME, RejNFT_SYMBOL);
    await rejectableNFT.deployed(); */

    // deploy ExchangeableRNFT
    const ExchangeableNFT = await ethers.getContractFactory("ExNFT");
    exchangeableNFT = await ExchangeableNFT.deploy(ExNFT_NAME, ExNFT_SYMBOL);
    await exchangeableNFT.deployed();
  });

  /**
   * Deployment
   */
  describe("Deployment", () => {
    it("Contracts deployed successfully", async () => {
      /* expect(nft.address).to.not.be.undefined;
      expect(rejectableNFT.address).to.not.be.undefined; */
      expect(exchangeableNFT.address).to.not.be.undefined;
    });

    it("Check name and symbol", async () => {
      /* expect(await nft.name()).to.be.equal(NFT_NAME);
      expect(await nft.symbol()).to.be.equal(NFT_SYMBOL);
      expect(await rejectableNFT.name()).to.be.equal(RejNFT_NAME);
      expect(await rejectableNFT.symbol()).to.be.equal(RejNFT_SYMBOL); */
      expect(await exchangeableNFT.name()).to.be.equal(ExNFT_NAME);
      expect(await exchangeableNFT.symbol()).to.be.equal(ExNFT_SYMBOL);
    });
  });

  /**
   * Mint a NFT
   */
  /* describe("Mint a NFT", () => {
    it("Non owner can't mint", async () => {
      await expect(nft.connect(user1).safeMint(user1.address)).to.be.reverted;
    });

    it("Owner can mint", async () => {
      // before minting, we have a balance of 0
      expect(await nft.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await nft.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 1
      expect(await nft.balanceOf(user1.address)).to.be.equal(1);
      expect(await nft.ownerOf(0)).to.be.equal(user1.address);
    });
  }); */

  /**
   * Transfer a NFT
   */
  /* describe("Transfer a NFT", () => {
    beforeEach(async () => {
      await nft.connect(owner).safeMint(user1.address);
    });

    it("You can't transfer if you aren't the owner nor approved", async () => {
      await expect(
        nft.connect(owner).transferFrom(user1.address, user2.address, 1)
      ).to.be.reverted;
    });

    it("Transfer a token", async () => {
      // before transfer, we have a balance of 0
      expect(await nft.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await nft.connect(user1).transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 1
      expect(await nft.balanceOf(user2.address)).to.be.equal(1);
      expect(await nft.ownerOf(0)).to.be.equal(user2.address);
    });
  }); */

  /**
   * Mint a Rejectable NFT
   */
  /* describe("Mint a Rejectable NFT", () => {
    it("Non owner can't mint", async () => {
      await expect(rejectableNFT.connect(user1).safeMint(user1.address)).to.be
        .reverted;
    });

    it("Owner can mint", async () => {
      // before minting, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await rejectableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );
    });

    it("Sender can cancel", async () => {
      // before minting, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await rejectableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can cancel
      await rejectableNFT.connect(owner).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject", async () => {
      // before minting, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await rejectableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can cancel
      await rejectableNFT.connect(user1).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before minting, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await rejectableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can accept
      await rejectableNFT.connect(user1).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await rejectableNFT.balanceOf(user1.address)).to.be.equal(1);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      ); 
    });
  }); */

  /**
   * Transfer a Rejectable NFT
   */
/*   describe("Transfer a Rejectable NFT", () => {
    beforeEach(async () => {
      await rejectableNFT.connect(owner).safeMint(user1.address);
      await rejectableNFT.connect(user1).acceptTransfer(0);
    });

    it("You can't transfer if you aren't the owner nor approved", async () => {
      await expect(
        rejectableNFT
          .connect(owner)
          .transferFrom(user1.address, user2.address, 1)
      ).to.be.reverted;
    });

    it("Transfer a token", async () => {
      // before transfer, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // transfer
      await rejectableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      ); 
    });

    it("Sender can cancel", async () => {
      // before transfer, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await rejectableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await rejectableNFT.connect(user1).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject", async () => {
      // before transfer, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await rejectableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await rejectableNFT.connect(user2).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before transfer, we have a balance of 0
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await rejectableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await rejectableNFT.connect(user2).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await rejectableNFT.balanceOf(user2.address)).to.be.equal(1);
      expect(await rejectableNFT.ownerOf(0)).to.be.equal(user2.address);
      // the receiver is removed as transferable owner
      expect(await rejectableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });
  }); */

   /**
   * Mint a Exchangeable NFT
   */
   describe("Mint an ExNFT", () => {
    it("Non owner can't mint", async () => {
      await (expect(exchangeableNFT
        .connect(user1)
        .safeMint(user1.address)).to.be
        .reverted);
    });

    it("Owner can mint", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );
    });

    it("Sender can cancel the mint transfer", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can cancel the transfer
      await exchangeableNFT.connect(owner).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject the mint trasfer", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can reject the mint transfer
      await exchangeableNFT.connect(user1).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can accept
      await exchangeableNFT.connect(user1).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(1);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      ); 
    });
  });
  /**
   * Transfer an ExNFT
   */
  describe("Transfer an Exchangeable NFT", () => {
    beforeEach(async () => {
      await exchangeableNFT.connect(owner).safeMint(user1.address);
      await exchangeableNFT.connect(user1).acceptTransfer(0);
    });

    it("User can't transfer if user is not the owner nor approved", async () => {
      await expect(
        exchangeableNFT
          .connect(owner)
          .transferFrom(user1.address, user2.address, 1)
      ).to.be.reverted;
    });

    it("Transfer a token", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // transfer
      await exchangeableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      ); 
    });

    it("Sender can cancel", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await exchangeableNFT.connect(user1).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the receiver can reject the transfer
      await exchangeableNFT.connect(user2).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can accept the transfer
      await exchangeableNFT.connect(user2).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(1);
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user2.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });
  });

  describe("Swap an Exchangeable NFT", () => {
    beforeEach(async() => {
        await exchangeableNFT.connect(owner).safeMint(user1.address);
        await exchangeableNFT.connect(owner).safeMint(user2.address);
        await exchangeableNFT.connect(owner).safeMint(user3.address);
        await exchangeableNFT.connect(user1).acceptTransfer(0);
        await exchangeableNFT.connect(user2).acceptTransfer(1);
        await exchangeableNFT.connect(user3).acceptTransfer(2);
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        expect(await exchangeableNFT.ownerOf(2)).to.be.equal(user3.address);

    })
    const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from now

    it("Non owner and nor approved can't open the swap proposal", async () => {
      await expect(exchangeableNFT
        .connect(user3)
        .swapProposal(user1.address, user2.address, 0, 1, deadline)).to.be.reverted;
    });

    it("Approved user can't open swap if sends an incorrect token owner", async ()  => {
      //user1 approves user3
      await exchangeableNFT.connect(user1).approve(user3.address, 0)
      //user3 is approved for token0
      expect(await exchangeableNFT.getApproved(0)).to.be.equal(user3.address)
      //user3 indicates token0 is owned by user2 (incorrect)
      await expect(exchangeableNFT
        .connect(user3)
        .swapProposal(user2.address, user1.address, 0, 1, deadline)).to.be.reverted;
    })

    it("Can't open swap to an incorrect tokenId2 owner", async () => {
      await expect(exchangeableNFT
        .connect(user1)
        .swapProposal(user1.address, user3.address, 0, 1, deadline)).to.be.reverted;
    });

    it("Can't set a deadline lower than now", async () => {
      await expect(exchangeableNFT
        .connect(user1)
        .swapProposal(user1.address, user2.address, 0, 1, Math.floor(Date.now() / 1000)- 10000)).to.be.reverted;
    });

    it("Open swap proposal", async () => {
        // open swap
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of token 0
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        ); 
    });

    it("Sender can't cancel an incorrect proposal", async () => {
      // swap proposal opened by user1
      await exchangeableNFT
        .connect(user1)
        .swapProposal(user1.address, user2.address, 0, 1, deadline);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // user2 is still the owner of token 1
      expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
      // the receiver is the transferable owner
      expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
        user2.address
      );
      // the sender can't cancel swap
      await expect(exchangeableNFT.connect(user1).rejectOrCancelSwap(0,2)).to.be.reverted;
    });

    it("Non approved caller can't cancel a swap proposal", async () => {
      // swap proposal opened by user1
      await exchangeableNFT
        .connect(user1)
        .swapProposal(user1.address, user2.address, 0, 1, deadline);
      // user1 is still the owner of the token
      expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
      // user2 is still the owner of token 1
      expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
      // the receiver is the transferable owner
      expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
        user2.address
      );
      // the sender can't cancel swap
      await expect(exchangeableNFT.connect(user3).rejectOrCancelSwap(0,1)).to.be.reverted;
    });

      it("Sender can cancel the proposal", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the sender can cancel swap
        await expect(exchangeableNFT.connect(user1).rejectOrCancelSwap(0,1)).to.not.be.reverted;
      });

      it("Receiver can reject the proposed swap", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver can reject the swap execution
        await exchangeableNFT.connect(user2).rejectOrCancelSwap(0,1);
        // the receiver is removed as transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is still the owner of the token 0
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
      }); 

      it("Receiver can't accept swap if enters an incorrect token2", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver enters an incorrect tokenId1
        await expect(exchangeableNFT.connect(user2).acceptSwap(0, 2)).to.be.reverted;
      });

      it("Receiver can't accept swap if enters an incorrect token1", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver enters an incorrect tokenId1
        await expect(exchangeableNFT.connect(user2).acceptSwap(2, 1)).to.be.reverted;
      });

      it("User can't accept swap if is not owner nor approved", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // user3 is non owner nor approved
        await expect(exchangeableNFT.connect(user3).acceptSwap(0, 1)).to.be.reverted;
      });

      it("Receiver can't accept the swap if the deadline has passed", async () => {
        const currentBlock = await ethers.provider.getBlockNumber();
        const blockTimestamp = (await ethers.provider.getBlock(currentBlock)).timestamp;

        const shortDeadline = Math.floor(blockTimestamp) + 3;

        // user 1 opens swap proposal with a short deadline
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, shortDeadline);
          // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the sender of the proposal is the applicant recipient
        expect((await exchangeableNFT.swapProp(0)).from).to.be.equal(
            user1.address
        )
        const sleep = (ms: any) => new Promise(r => setTimeout(r, ms));
        await sleep(2000);

        // the receiver can't accept swap
        await expect(exchangeableNFT.connect(user2).acceptSwap(0,1)).to.be.reverted;
      })
      
      it("Receiver can accept the swap", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver can accept the swap
        await exchangeableNFT.connect(user2).acceptSwap(0, 1);
        // the receiver is removed as transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is the new owner of the token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user1.address);
        // user2 is the new owner of the token 0
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user2.address);
        // user1 has a banace of 1 token
        expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(1);
        // user2 has a banace of 1 token
        expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(1);
      });  

      it("An approved user can accept the swap", async () => {
        //user2 approves user3
        await exchangeableNFT.connect(user2).approve(user3.address, 1)
        //user3 is approved
        expect(await exchangeableNFT.getApproved(1)).to.be.equal(user3.address)
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the approved user can accept the swap
        await exchangeableNFT.connect(user3).acceptSwap(0, 1);
        // the receiver is removed as transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is the new owner of the token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user1.address);
        // user2 is the new owner of the token 0
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user2.address);
        // user1 has a banace of 1 token
        expect(await exchangeableNFT.balanceOf(user1.address)).to.be.equal(1);
        // user2 has a banace of 1 token
        expect(await exchangeableNFT.balanceOf(user2.address)).to.be.equal(1);
      });  

      it("If token 1 owner has already opened a swap proposal the owner can't open a new swap proposal if deadline > now", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        //user1 tries to open a new swap proposal with token 0
        await expect(exchangeableNFT
        .connect(user1)
        .swapProposal(user1.address, user2.address, 0, 1, deadline)).to.be.reverted;
      });  

      it("User1 can open a new swap proposal involving a token with an already opened proposal if cancels the previous one", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // there are swap proposals for token 0 and 1
        expect((await exchangeableNFT.newProposal(0))).to.be.equal(
          true
        );
        expect((await exchangeableNFT.newProposal(1))).to.be.equal(
          true
        );
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );

        //user1 cancels the previous swap proposal 
        await exchangeableNFT.connect(user1).rejectOrCancelSwap(0,1)
        // there isn't any swap proposal for token 0
        expect((await exchangeableNFT.newProposal(0))).to.be.equal(
          false
        );
        // there isn't any swap proposal for token 1
        expect((await exchangeableNFT.newProposal(1))).to.be.equal(
          false
        );

        //user1 tries to open a new swap proposal with token 0
        await exchangeableNFT
            .connect(user1)
            .swapProposal(user1.address, user3.address, 0, 2, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 3
        expect(await exchangeableNFT.ownerOf(2)).to.be.equal(user3.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user3.address
        );
      });  

      it("If token 1 owner has already opened swap proposal the owner can open a new swap proposal if deadline < now", async () => {
        const currentBlock = await ethers.provider.getBlockNumber();
        const blockTimestamp = (await ethers.provider.getBlock(currentBlock)).timestamp;

        const shortDeadline = Math.floor(blockTimestamp) + 5;
        
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, shortDeadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );

        //user1 tries to open a new swap proposal with token 0
        await expect(exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline)).to.be.reverted;

        const sleep = (ms: any) => new Promise(r => setTimeout(r, ms));
        await sleep(5000);

        //user1 can open a new swap proposal with token 0
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user3.address, 0, 2, deadline);
          // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(2)).to.be.equal(user3.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user3.address
        );
        });  

        it("User2 can open a new swap proposal if user2 is not the sender of the already opened swap", async () => {
        // swap proposal opened by user1
        await exchangeableNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // there are swap proposals for token 0 and 1
        expect((await exchangeableNFT.newProposal(0))).to.be.equal(
          true
        );
        expect((await exchangeableNFT.newProposal(1))).to.be.equal(
          true
        );
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );

        //user2 opens a new swap proposal with token 2
        await exchangeableNFT
            .connect(user2)
            .swapProposal(user2.address, user3.address, 1, 2, deadline);
        // user2 is still the owner of the token
        expect(await exchangeableNFT.ownerOf(1)).to.be.equal(user2.address);
        // user3 is still the owner of token 3
        expect(await exchangeableNFT.ownerOf(2)).to.be.equal(user3.address);
        // the receiver is the transferable owner
        expect((await exchangeableNFT.swapProp(1)).to).to.be.equal(
          user3.address
        );
      });  

  })
});
