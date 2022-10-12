import { assert } from "chai";
import { ethers, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { FundMe } from "../../typechain-types";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", () => {
          let fundMe: FundMe;
          let deployer: SignerWithAddress;

          const sendValue = ethers.utils.parseEther("0.1");

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              // deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe");
          });

          it("allows people to fund and withdraw", async () => {
              const fundTxResponse = await fundMe.fund({ value: sendValue });
              await fundTxResponse.wait();

              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait();

              const endingFundMeBalance = await ethers.provider.getBalance(
                  fundMe.address
              );

              assert.equal(endingFundMeBalance.toString(), "0");
          });
      });
