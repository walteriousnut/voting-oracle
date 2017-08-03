pragma solidity ^0.4.4;

contract EligibilityOracle {

  struct EligibilityRequest {
    address voter;
    function(address, bool) external callback;
    bool initialized;
  }
  EligibilityRequest[] requests;
  
  event CheckEligibilityEvent(
        address indexed _from, 
        uint _value
      );

  function eligibilityOracle() {
    // constructor
  }

  // This function is called by users of the oracle to trigger a request for external data.
  function checkEligibility(address voter, function(address, bool) external callback) {
    //TODO Who should be able to call this function?
    
    // record this request in the request collection, for indexing purposes.
    requests.push(EligibilityRequest(voter, callback, true));

    // Fire the event that the external oracle is watching
    CheckEligibilityEvent(voter, requests.length-1);
  }

  function reply(uint requestId, bool response) {
    // Check that the Sender is from the trusted oracle.
    // This could be a collection of oracles, where the contract expects a significant majority
    // of oracles to confluence on a result.

    // If this requestId doesn't exist, not good.
    var request = requests[requestId];
    // if (!request.initialized) { throw; }

    // Fire the callback function.
    request.callback(request.voter, response);
  }
}
