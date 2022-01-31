# publicMintTool

This is a public mint tool for https://etherscan.io/address/0x984f7b398d577c0adde08293a53ae9d3b6b7a5c5

All pubic mint tools should be cutomized. However, the baseline are the same. You can use it as a start point.

There are several places you need to change code based on contrat and mint settings. So you need to understand the smart contract first.

# Pre-requirement
1 Nodejs.v14 is recommended.
2 Alchemy wss api is required. The api is free. You can create account by yourself.

# Configuration
In config.js. we need to change thing before use.

    // required. wallet privateKey, you can find it in your metamask
    privateKey : "<Your private key>",
    
    // required. Your wallet address   
    fromAddress : "<Your wallet address>".toLocaleLowerCase(),
    
    // reuiqred. Your target contract address
    toAddress: "<Your target contract address>".toLocaleLowerCase(),

    // required. Find out the contract creator address
    creatorAddress: "<The creator wallet address>".toLocaleLowerCase(),

    // required. The price of public mint. It should based on the smart contract
    price: "0.08",                    
    
    // required. How many items you wants to buy
    maxPriorityFeePerGas : "200", 
    
    // required. The collection contract address you want to buy                                                                           
    maxFeePerGas : "300",                    
    
    // required. The num you want to mint
    number: "1",

    // required. http provider from alchemy. It must be wss
    wssMainnet: "wss://eth-mainnet.alchemyapi.io/v2/<mainnet api key>",

    // required. http provider from alchemy. It must be wss
    wssRinkeby: "wss://eth-rinkeby.alchemyapi.io/v2/<Rinkeby api key>",

    // required. http provider from alchemy. It must be wss
    wssGoerli : "wss://eth-goerli.alchemyapi.io/v2/<Goerli api key>",

    // optional. debug usage. The value should be "Rinkeby" for rinkeby, "Goerli" for goerli or "" for mainnet
    network : "Goerli"

In public.js, there are two place need to be customized:
  1. Change mint function name
  
  //-----------------------------------------------------------------
  //--------------- Change this function every time------------------
  
  let extraData =  await contract.methods.mintSAC(config.number);
  
  //-----------------------------------------------------------------
  //-----------------------------------------------------------------
  
  2. Change the signal that you want to monitor
  
  //-----------------------------------------------------------------
  //--------------- Change this function every time------------------
  
  if((decodedData.name == 'flipPublicSaleState')){
  
  //-----------------------------------------------------------------
  //-----------------------------------------------------------------
  
In abi.json, you need to copy the smart contract abi and paste in abi.json.  

# All privacy information are stored in your local workspace. The repo will not use any personal information or private key. Be careful about your wallet.
