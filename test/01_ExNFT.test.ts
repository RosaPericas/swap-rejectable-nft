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
const RNFT_NAME = "Rejectable NFT test";
const RNFT_SYMBOL = "RNFT1";
const ERNFT_NAME = "Exchangeable RNFT test";
const ERNFT_SYMBOL = "ERNFT1";

describe("ExchangeableRNFT", () => {
  let nft: Contract;
  let rejectableNFT: Contract;
  let exchangeableRNFT: Contract;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  beforeEach(async () => {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // deploy NFT
    const NFT = await ethers.getContractFactory("ERC721");
    nft = await NFT.deploy(NFT_NAME, NFT_SYMBOL);
    await nft.deployed();

    // deploy RejectableNFT
    const RejectableNFT = await ethers.getContractFactory("RejNFT");
    rejectableNFT = await RejectableNFT.deploy(RNFT_NAME, RNFT_SYMBOL);
    await rejectableNFT.deployed();

    // deploy ExchangeableRNFT
    const ExchangeableRNFT = await ethers.getContractFactory("ExNFT");
    exchangeableRNFT = await ExchangeableRNFT.deploy(ERNFT_NAME, ERNFT_SYMBOL);
    await exchangeableRNFT.deployed();
  });

  /**
   * Deployment
   */
  describe("Deployment", () => {
    it("Contracts deployed successfully", async () => {
      expect(nft.address).to.not.be.undefined;
      expect(rejectableNFT.address).to.not.be.undefined;
      expect(exchangeableRNFT.address).to.not.be.undefined;
    });

    it("Check name and symbol", async () => {
      expect(await nft.name()).to.be.equal(NFT_NAME);
      expect(await nft.symbol()).to.be.equal(NFT_SYMBOL);
      expect(await rejectableNFT.name()).to.be.equal(RNFT_NAME);
      expect(await rejectableNFT.symbol()).to.be.equal(RNFT_SYMBOL);
      expect(await exchangeableRNFT.name()).to.be.equal(ERNFT_NAME);
      expect(await exchangeableRNFT.symbol()).to.be.equal(ERNFT_SYMBOL);
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
  describe("Mint a Rejectable NFT", () => {
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
  });

  /**
   * Transfer a Rejectable NFT
   */
  describe("Transfer a Rejectable NFT", () => {
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
  });

   /**
   * Mint a Exchangeable RNFT
   */
   describe("Mint an ERNFT", () => {
    it("Non owner can't mint", async () => {
      await expect(exchangeableRNFT.connect(user1).safeMint(user1.address)).to.be
        .reverted;
    });

    it("Owner can mint", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableRNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );
    });

    it("Sender can cancel", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableRNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can cancel
      await exchangeableRNFT.connect(owner).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableRNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can cancel
      await exchangeableRNFT.connect(user1).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before minting, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      // mint
      await exchangeableRNFT.connect(owner).safeMint(user1.address);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(ZERO_ADDRESS);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user1.address
      );

      // the sender can accept
      await exchangeableRNFT.connect(user1).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(1);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      ); 
    });
  });
  /**
   * Transfer a Rejectable NFT
   */
  describe("Transfer an Exchangeable RNFT", () => {
    beforeEach(async () => {
      await exchangeableRNFT.connect(owner).safeMint(user1.address);
      await exchangeableRNFT.connect(user1).acceptTransfer(0);
    });

    it("You can't transfer if you aren't the owner nor approved", async () => {
      await expect(
        exchangeableRNFT
          .connect(owner)
          .transferFrom(user1.address, user2.address, 1)
      ).to.be.reverted;
    });

    it("Transfer a token", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // transfer
      await exchangeableRNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      ); 
    });

    it("Sender can cancel", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableRNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await exchangeableRNFT.connect(user1).cancelTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can reject", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableRNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await exchangeableRNFT.connect(user2).rejectTransfer(0);
      // after minting, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });

    it("Receiver can accept transfer", async () => {
      // before transfer, we have a balance of 0
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // transfer
      await exchangeableRNFT
        .connect(user1)
        .transferFrom(user1.address, user2.address, 0);
      // after transfer, we have a balance of 0, because the receiver needs to accept
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(0);
      // user1 is still the owner of the token
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
      // the receiver is the transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        user2.address
      );

      // the sender can cancel
      await exchangeableRNFT.connect(user2).acceptTransfer(0);
      // after minting, we have a balance of 1
      expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(1);
      expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user2.address);
      // the receiver is removed as transferable owner
      expect(await exchangeableRNFT.transferableOwnerOf(0)).to.be.equal(
        ZERO_ADDRESS
      );
    });
  });
  describe("Swap an Exchangeable RNFT", () => {
    beforeEach(async() => {
        await exchangeableRNFT.connect(owner).safeMint(user1.address);
        await exchangeableRNFT.connect(owner).safeMint(user2.address);
        await exchangeableRNFT.connect(owner).safeMint(user3.address);
        await exchangeableRNFT.connect(user1).acceptTransfer(0);
        await exchangeableRNFT.connect(user2).acceptTransfer(1);
        await exchangeableRNFT.connect(user3).acceptTransfer(2);
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        expect(await exchangeableRNFT.ownerOf(2)).to.be.equal(user3.address);

    })
    const deadline = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes from now

    it("Open swap proposal", async () => {
        // transfer
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of token 0
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        ); 
      });

      it("Sender can cancel the proposal", async () => {
        // swap proposal opened by user1
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the sender can cancel swap
        await expect(exchangeableRNFT.connect(user2).cancelSwap(0,1)).to.not.be.reverted;
      });

      it("Receiver can reject the proposed swap", async () => {
        // swap proposal opened by user1
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver can reject the swap execution
        await exchangeableRNFT.connect(user2).cancelSwap(0,1);
        // the receiver is removed as transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is still the owner of the token 0
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
      }); 
/* 
      it("Receiver can't accept the swap if the deadline has passed", async () => {
        const shortDeadline = Math.floor(Date.now() / 1000) + 60 * 3; // 1 minute from now

        // user 1 opens swap proposal with a short deadline
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, shortDeadline);
          // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the sender of the proposal is the applicant recipient
        expect((await exchangeableRNFT.swapProp(1)).from).to.be.equal(
            user1.address
        )
        // the receiver can't accept swap
        await expect(exchangeableRNFT.connect(user2).acceptSwap(0,1)).to.be.reverted;
      }) */
      
      it("Receiver can accept the swap", async () => {
        // swap proposal opened by user1
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the receiver can accept the swap
        await exchangeableRNFT.connect(user2).acceptSwap(0, 1);
        // the receiver is removed as transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is the new owner of the token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user1.address);
        // user2 is the new owner of the token 0
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user2.address);
        // user1 has a banace of 1 token
        expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(1);
        // user2 has a banace of 1 token
        expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(1);
      });  

      it("An approved user can accept the swap", async () => {
        //user2 approves user3
        await exchangeableRNFT.connect(user2).approve(user3.address, 1)
        //user3 is approved
        expect(await exchangeableRNFT.getApproved(1)).to.be.equal(user3.address)
        // swap proposal opened by user1
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        // the approved user can accept the swap
        await exchangeableRNFT.connect(user3).acceptSwap(0, 1);
        // the receiver is removed as transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
            ZERO_ADDRESS
        );
        // user1 is the new owner of the token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user1.address);
        // user2 is the new owner of the token 0
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user2.address);
        // user1 has a banace of 1 token
        expect(await exchangeableRNFT.balanceOf(user1.address)).to.be.equal(1);
        // user2 has a banace of 1 token
        expect(await exchangeableRNFT.balanceOf(user2.address)).to.be.equal(1);
      });  

      it("If there is an opened swap proposal it not possible to open another one involving one of the same tokens", async () => {
        // swap proposal opened by user1
        await exchangeableRNFT
          .connect(user1)
          .swapProposal(user1.address, user2.address, 0, 1, deadline);
        // user1 is still the owner of the token
        expect(await exchangeableRNFT.ownerOf(0)).to.be.equal(user1.address);
        // user2 is still the owner of token 1
        expect(await exchangeableRNFT.ownerOf(1)).to.be.equal(user2.address);
        // the receiver is the transferable owner
        expect((await exchangeableRNFT.swapProp(0)).to).to.be.equal(
          user2.address
        );
        //user3 tries to open a new swap proposal involving user2 token
        await expect(exchangeableRNFT
        .connect(user3)
        .swapProposal(user3.address, user2.address, 2, 1, deadline)).to.be.reverted;
      });  

  })
});
