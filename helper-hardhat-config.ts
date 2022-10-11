export interface networkConfigItem {
    ethUsdPriceFeed?: string;
    blockConfirmations?: number;
}

export interface networkConfigInfo {
    [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
    localhost: {},
    hardhat: {},
    // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
    goerli: {
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
        blockConfirmations: 6,
    },
};

export const developmentChains = ["hardhat", "localhost"];
