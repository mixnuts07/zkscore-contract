import { ethers } from "hardhat";

async function main() {
  const contract = await ethers.getContractFactory("ZkScore");
  const zkscore = await contract.deploy();

  await zkscore.deployed();

  console.log(`deployed to ${zkscore.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
