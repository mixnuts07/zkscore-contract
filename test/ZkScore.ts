import { expect } from "chai";
import { ethers } from "hardhat";

describe("ZkScore contract", function () {

  let owner: any;
  let addr1: any;
  let addr2: any;
  let contract: any;
  let ZkScore: any;

  this.beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await ethers.getContractFactory("ZkScore");
    ZkScore = await contract.deploy();
  })

  it("check -> name and symbol",async () => {
    const name = await ZkScore.name();
    const symbol = await ZkScore.symbol();
    expect(name).to.equal("Zk Score");
    expect(symbol).to.equal("ZKS");
  })

  it("check -> first Rgisteration", async () => {
    const user = await owner.getAddress();
    expect(await ZkScore.isRegistered(user)).to.equal(false);
    expect(await ZkScore.balanceOf(user)).to.equal(0);
    await ZkScore.firstResister();
    expect(await ZkScore.balanceOf(user)).to.equal(1);
    expect(await ZkScore.isRegistered(user)).to.equal(true);
    await expect(ZkScore.firstResister()).to.be.revertedWith("You already registered");
    const genesisHash = await ZkScore.userIdentityState(user);
    const hashedZero = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('0'))
    const hashedUserAddr = ethers.utils.keccak256(user);
    const tmp = hashedZero.substring(2,)+hashedUserAddr.substring(2,);
    expect(ethers.utils.keccak256("0x"+tmp)).to.equal(genesisHash);
  });

  it("check -> add reputation", async () => {
    const from = await addr1.getAddress();
    const to = await addr2.getAddress();

    let genesisScore = ethers.utils.toUtf8Bytes('0'+to);
    let hashedGenesis = ethers.utils.keccak256(genesisScore);
    await expect(ZkScore.mint(to, hashedGenesis)).to.be.revertedWith("Recipients has not registered yet");
    await ZkScore.connect(addr2).firstResister();
    await expect(ZkScore.connect(addr2).mint(to, hashedGenesis)).to.be.revertedWith("You cannot add reputation to yourself");
    // await expect(ZkScore.connect(addr2).test(to)).to.be.revertedWith("Msg.sender must be EOA");
    expect(await ZkScore.balanceOf(to)).to.equal(1);
    
    const currentRoot = await ZkScore.userIdentityState(to);
    const addr2Identifier = await ZkScore.userAddressHash(to);
    const addr2Hash = ethers.utils.keccak256(to);
    expect(addr2Hash).to.equal(addr2Identifier); // check keccak256(msg.sender)

    let reputation = ethers.utils.toUtf8Bytes('5'+from);
    let hashedReputation = ethers.utils.keccak256(reputation);
    await ZkScore.connect(addr1).mint(to, hashedReputation);
    expect(await ZkScore.balanceOf(to)).to.equal(2);

    let tmp = hashedReputation.substring(2,)+addr2Identifier.substring(2,);
    const leaf = ethers.utils.keccak256("0x"+tmp)

    // check user state
    tmp = currentRoot.substring(2,)+leaf.substring(2,);
    const newRoot = ethers.utils.keccak256("0x"+tmp);
    expect(await ZkScore.userIdentityState(to)).to.equal(newRoot);

    // check global state
    // tmp = globalRoot.substring(2,)+leaf.substring(2,);
    // const newGlobalRoot = ethers.utils.keccak256("0x"+tmp);
    // expect(await ZkScore.globalState()).to.equal(newGlobalRoot);
  });

  it("check -> non-transferable", async () => {
    const from = await addr1.getAddress();
    const to = await addr2.getAddress();

    await ZkScore.connect(addr2).firstResister();
    let reputation = ethers.utils.toUtf8Bytes('5'+from);
    let hashedReputation = ethers.utils.keccak256(reputation);
    await ZkScore.connect(addr1).mint(to, hashedReputation);
    
    await expect(ZkScore.connect(addr2).transferFrom(to, from, 1)).to.be.rejectedWith("Err: token is SOUL BOUND");
    await expect(ZkScore.connect(addr2).approve(from, 1)).to.be.rejectedWith("Err: token is SOUL BOUND");
    await expect(ZkScore.connect(addr2).setApprovalForAll(from, false)).to.be.rejectedWith("Err: token is SOUL BOUND");
    await expect(ZkScore.connect(addr2)["safeTransferFrom(address,address,uint256)"](to, from, 0)).to.be.rejectedWith("Err: token is SOUL BOUND");
  });

});