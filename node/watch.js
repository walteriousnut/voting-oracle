var args = process.argv.slice(2);

var Web3 = require('web3');
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

// Create a rudimentary voter roll that includes only even numbered voters.
console.log("Network contains + " + web3.eth.accounts.length + " voters.");
var voters = web3.eth.accounts.filter((element, index) => {
  return index % 2 === 0;
});

console.log("The following voters are eligible " + voters);

var oracleAbi = '[{"constant": false,"inputs": [],"name": "eligibilityOracle","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "voter","type": "address"},{"name": "callback","type": "function"}],"name": "checkEligibility","outputs": [],"payable": false,"type": "function"},{"constant": false,"inputs": [{"name": "requestId","type": "uint256"},{"name": "response","type": "bool"}],"name": "reply","outputs": [],"payable": false,"type": "function"},{"anonymous": false,"inputs": [{"indexed": true,"name": "_from","type": "address"},{"indexed": false,"name": "_value","type": "uint256"}],"name": "CheckEligibilityEvent","type": "event"}]';
var oracleAbiObj = JSON.parse(oracleAbi);
var oracleAddress =  args[0]; // '0x6be34af0753002f3c52f59bc6eafb012e649f4bc';

var oracleInstance = web3.eth.contract(oracleAbiObj).at(oracleAddress);

var watcher = oracleInstance.allEvents((error, result) => { 
  if (error) { 
    console.error(error); 
    return;
  } 
  
  if (result.event === "CheckEligibilityEvent") {
    var voter = result.args['_from'];
    var requestId = result.args['_value'];
    var eligible = false;

    console.log("-----------------------------");
    console.log("Received Eligibility Check #" + result.args['_value'] + " for: " + result.args['_from']);
    if (voters.indexOf(voter) > -1) {
      console.log("Voter is Eligible.");
      eligible = true;
    }
    else {
      console.log("Voter in Ineligible.");
    }

    // Reply to the Oracle Contract to provide the eligibility result.
    oracleInstance.reply(requestId, eligible, {from: args[1], gas: 200000}, function(error, result) { if (!error) console.log(result); else console.error(error);});
  }  
});

rl.question('Oracle is watching. Hit any key to exit. ', (answer) => {
  console.log('Exiting');
  watcher.stopWatching();
  rl.close();
});

// All the code below is for web3 v1b13

// Check Event parameters.
  var requestId = 1;
  var account = 0x0;
  
  // Lookup Eligibility here ...
  var eligible = true;
  // ...

  // Call back to the Oracle contract with results.
  /* oracleInstance.methods.reply(requestId, account, eligible).send({from: '0x31251985aca22dfe2aaaf2daca29a26a66c1228e', gas: 1000000})
  .on('transactionHash', hash => {
      console.log("Hash!");
      console.log(hash);
  })
  .on('receipt', receipt => {
      console.log("Receipt!");
      console.log(receipt);
  })
  .on('confirmation', (confirmationNumber, receipt) => {
      console.log("Confirmation!");
      console.log(confirmationNumber);
      console.log(receipt);
  })
  .on('error', console.error);
  */