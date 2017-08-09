var EligibilityOracle =artifacts.require("./EligibilityOracle.sol");

module.exports = function(deployer) {
  deployer.deploy(EligibilityOracle);
};
