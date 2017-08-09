var args = process.argv.slice(2);

var Web3 = require('web3');
var BigNumber = require('bignumber.js');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

var version = web3.version.api;
console.log(version);

var electionAbi = '[ { "constant": true, "inputs": [], "name": "totalInvalid", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "total", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalConfirmed", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalUnconfirmed", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "voter", "type": "address" }, { "name": "eligible", "type": "bool" } ], "name": "setElegibility", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "vote", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalInelegible", "outputs": [ { "name": "", "type": "uint256" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "state", "outputs": [ { "name": "", "type": "uint8" } ], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "", "type": "address" } ], "name": "Voted", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "", "type": "address" } ], "name": "Finalised", "type": "event" } ]';
var electionAbiObj = JSON.parse(electionAbi);
var electionAddress= args[0]; //'0x958484363b03f5cff8de94986a3537bd4f9c84de';

var electionInstance = web3.eth.contract(electionAbiObj).at(electionAddress);

console.log("\nPlacing Vote for: [" + args[1] + "]");

electionInstance.vote({from: args[1], gas: 200000}, function(error, result) { if (!error) console.log(result); else console.error(error);});

var watcher = electionInstance.allEvents((error, result) => { 
  if (error) { 
    console.error(error); 
    return;
  } 
  
  if (result.event === "Finalised") {
    console.log("\nA Vote was Finalised");
    console.log("Total: " + electionInstance.total().toNumber());
    console.log("Unconfirmed: " + electionInstance.totalUnconfirmed().toNumber());
    console.log("Ineligible: " + electionInstance.totalInelegible().toNumber());
    console.log("Confirmed: " + electionInstance.totalConfirmed().toNumber());
    console.log("-----------------------------\n");
  }  
});

rl.question('\nVote Submitted, watching Election ... Hit any key to exit.\n ', (answer) => {
  console.log('Exiting');
  watcher.stopWatching();
  rl.close();
});