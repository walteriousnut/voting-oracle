var EligibilityOracle =artifacts.require("./EligibilityOracle.sol");
var Election =artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(EligibilityOracle).then( function() {
    return deployer.deploy(Election, EligibilityOracle.address);
  });
};
