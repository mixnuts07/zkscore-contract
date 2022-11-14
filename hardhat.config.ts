import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  paths: {
    artifacts: "./artifacts"
  }
};

export default config;
