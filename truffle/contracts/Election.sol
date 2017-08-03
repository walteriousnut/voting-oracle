pragma solidity ^0.4.4;
import "./EligibilityOracle.sol";

contract Election {

  enum ElectionStates { Proposed, Open, Closed }
  enum VoteStates { Unconfirmed, Confirmed, Ineligible }

  ElectionStates public state;
  uint public total;
  uint public totalUnconfirmed;
  uint public totalInelegible;
  uint public totalConfirmed;
  uint public totalInvalid;

  struct Vote {
    VoteStates state;
    address voter;
    bool initialized;
  }
  mapping (address => Vote) votes;

  event Voted(address);
  event Finalised(address); 

  EligibilityOracle constant oracle = EligibilityOracle(0x70962db1bdd843c719c0ddd181262746732c09eb);

  function Election() {
    // constructor
    state = ElectionStates.Proposed;
  }

  // Receive a Vote from someone
  function vote() {
    // If this voter has already voted, not good.
    if (votes[msg.sender].initialized) { throw; }

    // Create the Vote
    votes[msg.sender] = Vote({
      state: VoteStates.Unconfirmed,
      voter: msg.sender,
      initialized: true
    });

    // Update counter.
    total++;
    totalUnconfirmed++;

    // Call the eligibility oracle and provide it with a pointer to our callback function.
    oracle.checkEligibility(msg.sender, this.setElegibility);

    // Fire the Voted event for any externals who might be watching.
    Voted(msg.sender);
  }

  // This function is provided as the callback from the eligibility oracle contract.
  // Only that singleton contract should ever call this function.
  function setElegibility(address voter, bool eligible){

    // Only the singleton oracle should ever call this.
    // if (msg.sender == address(oracle)) { throw; }

    // If the defined voter hasn't ever voted, not good.
    // if (!votes[voter].initialized) { throw; }

    if (eligible) {
      // Confirmed to be eligible. finalise the vote and update the counter
      votes[voter].state = VoteStates.Confirmed;
      totalConfirmed++;
    }
    else {
      // Confirmed to ineligible, finalise as ineligible and update counter
      votes[voter].state = VoteStates.Ineligible;
      totalInelegible++;  
    }

    // Reduce the total outstanding confirmations.
    totalUnconfirmed--;

    // Fire the Finalised event for any externals who might be watching.
    Finalised(voter);
  }
}