const AlchemyWeb3 = require("@alch/alchemy-web3");
const _ = require("lodash");
const Tx = require('ethereumjs-tx').Transaction
const abiDecoder = require('abi-decoder');
const ethers = require('ethers'); // Require the ethers library
const utils = require('ethers').utils;
const config = require('./config.js')
let json = require('./abi.json');

var gasRank = [];

const pendingTrasactions = async () => {
  let web3URL;
  let targetContract;
  let creator;


  console.log('Network Mode:', config.network);
  switch(config.network) {
    //---------------- TEST USAGE-------------------------
    case 'Rinkeby':{
      web3URL = config.wssRinkeby;
      targetContract = "";
      creator = "";
      break;
    }
    case 'Goerli':{
      web3URL = config.wssGoerli;
      targetContract = "";
      creator = "";
      break;
    }
    //-----------------------------------------------------
    default: {
      web3URL = config.wssMainnet;
      targetContract = config.toAddress;
      creator = config.creatorAddress;
    }
  }

  console.log('Web3URL:', web3URL);
  const web3 = AlchemyWeb3.createAlchemyWeb3(web3URL);
  // UNIT TEST
  const txn = await web3.eth.getTransaction('0x55422b2119d5ec1922c7be967c796817d2012c6dae594d04fe113d0c29a1eb41');
  if(txn.gasPrice === '11888000000000'){
    console.log("Unit test passed")
  }
  else{
    throw new Error("Your web3 setting is failing...")
  }
  // DEBUG SECTION
  //sendMinimalLondonTx(web3,data,targetContract,config.price);

  web3.eth
    .subscribe("alchemy_filteredNewFullPendingTransactions", {        // monitor confirm txn gas, change the pendinngT.... to logs
      address: targetContract.toLocaleLowerCase(), 
    })
    .on("data", async (blockHeader) => {
      // console.log('xxxxxx blockHeader:', blockHeader);
      let maxFeePerGas;
      let maxPriorityFeePerGas;
      if('maxPriorityFeePerGas' in blockHeader){
        maxFeePerGas = web3.utils.fromWei(blockHeader.maxFeePerGas, 'gwei');
        maxPriorityFeePerGas = web3.utils.fromWei(blockHeader.maxPriorityFeePerGas, 'gwei');
      }
      else{
        if('gasPrice' in blockHeader){
          maxFeePerGas = web3.utils.fromWei(blockHeader.gasPrice, 'gwei');
          maxPriorityFeePerGas = (web3.utils.fromWei(blockHeader.gasPrice, 'gwei') > 60)? web3.utils.fromWei(blockHeader.gasPrice, 'gwei') - 60 : 0;
        }
      }
      // console.log("gas",maxFeePerGas,maxPriorityFeePerGas, typeof maxPriorityFeePerGas);
      gasRank.push([parseFloat(maxFeePerGas),parseFloat(maxPriorityFeePerGas)]);
    });
};

function roundTo(num) {
  return Math.round(num * 100) / 100
}

const sortRank = () => {
  setInterval(function(){
    let copyRank = JSON.parse(JSON.stringify(gasRank));
    gasRank = [];
    copyRank.sort(function(a, b) {
        return b[1] - a[1];
    });
    let sum = 0.0;
    copyRank = copyRank.slice(0,200);
    for(let i of copyRank){
      sum += i[1];
    }
    if(copyRank.length){
      console.log("PENDING TXN (",copyRank.length ,") MAX TIPS(GWEI)", roundTo(copyRank[0][1]), "MIN TIPS(GWEI)", roundTo(copyRank[copyRank.length-1][1]), "Average(GWEI)", roundTo(sum/copyRank.length));
    }
    else{
      console.log("No pending txn");
    }
  },5000)
}

pendingTrasactions();
sortRank();
