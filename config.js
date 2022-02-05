module.exports = Object.freeze({
    // required. wallet privateKey
    privateKey : "<Your private key>",
    
    // required. Your wallet address   
    fromAddress : "<Your wallet address>".toLocaleLowerCase(),
    
    // reuiqred. Your target contract address
    toAddress: "<Your target contract address>".toLocaleLowerCase(),

    // required. Find out the contract creator address
    creatorAddress: "<The creator wallet address>".toLocaleLowerCase(),

    // required. The price of public mint
    price: "0.08",                    
    
    // required. How many items you wants to buy
    maxPriorityFeePerGas : "200", 
    
    // required. The collection contract address you want to buy                                                                           
    maxFeePerGas : "300",                    
    
    // required. The num you want to mint
    number: "1",

    // required. http provider from infura or alchemy. It must be wss
    wssMainnet: "wss://eth-mainnet.alchemyapi.io/v2/<mainnet api key>",

    // required. http provider from infura or alchemy. It must be wss
    wssRinkeby: "wss://eth-rinkeby.alchemyapi.io/v2/<Rinkeby api key>",

    // required. http provider from infura or alchemy. It must be wss
    wssGoerli : "wss://eth-goerli.alchemyapi.io/v2/<Goerli api key>",

    // optional. debug usage. The value should be "Rinkeby" for rinkeby, "Goerli" for goerli or "" for mainnet
    network : "Goerli",

    // timere script const, the start time of dutch
    time: 1644069600,
});
