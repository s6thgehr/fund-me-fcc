import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe, MockV3Aggregator } from "../../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe: FundMe;
          let mockV3Aggregator: MockV3Aggregator;
          let deployer: SignerWithAddress;

          beforeEach(async () => {
              const accounts = await ethers.getSigners();
              deployer = accounts[0];
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe");
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
          });

          describe("constructor", () => {
              it("sets the aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", () => {
              const fundedAmount = ethers.utils.parseEther("1");
              it("fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("updates the amount funded data structure", async () => {
                  await fundMe.fund({ value: fundedAmount });
                  const response = await fundMe.getFundedAmountFromAddress(
                      deployer.address
                  );
                  assert.equal(response.toString(), fundedAmount.toString());
              });
              it("adds funder to array of funders", async () => {
                  await fundMe.fund({ value: fundedAmount });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer.address);
              });
          });

          describe("withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: ethers.utils.parseEther("1") });
              });
              it("owner/deployer receives all funds", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address);

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReceipt = await transactionResponse.wait();
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address);

                  assert.equal(endingFundMeBalance.toString(), "0");
                  assert.equal(
                      endingDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString()
                  );
              });
              it("allows only owner to withdraw funds", async () => {
                  const accounts = await ethers.getSigners();
                  await expect(
                      fundMe.connect(accounts[1]).withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });
      });
