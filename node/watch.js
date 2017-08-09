var args = process.argv.slice(2);

var Web3 = require('web3');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prepare the web3 instance and connect it to my RPC endpoint.
if (typeof web3 !== 'undefined') {
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
}

// Create a rudimentary voter roll that includes only even numbered voters based on the accounts managed by my RPC endpoint
console.log("\nNetwork contains + " + web3.eth.accounts.length + " voters.\n");
var voters = web3.eth.accounts.filter((element, index) => {
  return index % 2 === 0;
});

console.log("The following voters are eligible " + voters  + "\n\n");

// Create a reference to the Oracle contract.
var oracleAbi = '[{"constant": false,"inputs": [],"name": "eligibilityOracle","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "voter","type": "address"},{"name": "callback","type": "function"}],"name": "checkEligibility","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "requestId","type": "uint256"},{"name": "response","type": "bool"}],"name": "reply","outputs": [],"payable": false,"type": "function"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_from","type": "address"},{"indexed": false,"name": "_value","type": "uint256"}],"name": "CheckEligibilityEvent","type": "event"}]';
var oracleAbiObj = JSON.parse(oracleAbi);
var oracleAddress =  args[0];

var oracleInstance = web3.eth.contract(oracleAbiObj).at(oracleAddress);

// Watch all events published from this contract, I could have also just subscribed to the 'CheckEligibilityEvent' specifically.
var watcher = oracleInstance.allEvents((error, result) => { 
  if (error) { 
    console.error(error); 
    return;
  } 
  
  if (result.event === "CheckEligibilityEvent") {
    var voter = result.args['_from'];
    var requestId = result.args['_value'];
    var eligible = false;

    console.log("\n-----------------------------");
    console.log("Received Eligibility Check #" + result.args['_value'] + " for: " + result.args['_from']);
    if (voters.indexOf(voter) > -1) {
      console.log("Voter is Eligible.");
      eligible = true;
    }
    else {
      console.log("Voter in Ineligible.");
    }
    console.log("----------------------------\n");

    // Reply to the Oracle Contract to provide the eligibility result.
    console.log("Replying to the Oracle Contract ...")
    oracleInstance.reply(requestId, eligible, {from: args[1], gas: 200000}, function(error, result) { if (!error) console.log(result); else console.error(error);});
    console.log("----------------------------\n");
  }  
});

// Use readline to allow users to hit any key to exit.
rl.question('Oracle is watching. Hit any key to exit. \n', (answer) => {
  console.log('Exiting');
  watcher.stopWatching();
  rl.close();
});