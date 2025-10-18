// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title BasePaySplitter
 * @dev A payment splitter contract that allows ETH to be split among multiple payees
 * according to predefined shares. Built for Base network.
 */
contract BasePaySplitter {
    // Events
    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentReleased(address indexed to, uint256 amount);
    event PayeeAdded(address indexed account, uint256 shares);

    // State variables
    uint256 private _totalShares;
    uint256 private _totalReleased;

    mapping(address => uint256) private _shares;
    mapping(address => uint256) private _released;
    address[] private _payees;

    /**
     * @dev Creates an instance of `BasePaySplitter` where each account in `payees`
     * is assigned the number of shares at the matching position in the `shares` array.
     *
     * All addresses in `payees` must be non-zero. Both arrays must have the same non-zero length,
     * and there must be no duplicates in `payees`.
     */
    constructor(address[] memory payees, uint256[] memory shares_) payable {
        require(payees.length == shares_.length, "BasePaySplitter: payees and shares length mismatch");
        require(payees.length > 0, "BasePaySplitter: no payees");

        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares_[i]);
        }
    }

    /**
     * @dev The Ether received will be logged with {PaymentReceived} events.
     */
    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    /**
     * @dev Getter for the total shares held by payees.
     */
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    /**
     * @dev Getter for the total amount of Ether already released.
     */
    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    /**
     * @dev Getter for the amount of shares held by an account.
     */
    function shares(address account) public view returns (uint256) {
        return _shares[account];
    }

    /**
     * @dev Getter for the amount of Ether already released to a payee.
     */
    function released(address account) public view returns (uint256) {
        return _released[account];
    }

    /**
     * @dev Getter for the address of the payee number `index`.
     */
    function payee(uint256 index) public view returns (address) {
        return _payees[index];
    }

    /**
     * @dev Getter for the number of payees.
     */
    function payeesCount() public view returns (uint256) {
        return _payees.length;
    }

    /**
     * @dev Triggers a transfer to `account` of the amount of Ether they are owed,
     * according to their percentage of the total shares and their previous withdrawals.
     */
    function release(address payable account) public {
        require(_shares[account] > 0, "BasePaySplitter: account has no shares");

        uint256 payment = releasable(account);
        require(payment != 0, "BasePaySplitter: account is not due payment");

        _released[account] += payment;
        _totalReleased += payment;

        (bool success, ) = account.call{value: payment}("");
        require(success, "BasePaySplitter: transfer failed");

        emit PaymentReleased(account, payment);
    }

    /**
     * @dev Getter for the amount of payee's releasable Ether.
     */
    function releasable(address account) public view returns (uint256) {
        uint256 totalReceived = address(this).balance + _totalReleased;
        return _pendingPayment(account, totalReceived, _released[account]);
    }

    /**
     * @dev Internal logic for computing the pending payment of an `account` given the token historical balances and
     * already released amounts.
     */
    function _pendingPayment(
        address account,
        uint256 totalReceived,
        uint256 alreadyReleased
    ) private view returns (uint256) {
        return (totalReceived * _shares[account]) / _totalShares - alreadyReleased;
    }

    /**
     * @dev Add a new payee to the contract.
     * @param account The address of the payee to add.
     * @param shares_ The number of shares owned by the payee.
     */
    function _addPayee(address account, uint256 shares_) private {
        require(account != address(0), "BasePaySplitter: account is the zero address");
        require(shares_ > 0, "BasePaySplitter: shares are 0");
        require(_shares[account] == 0, "BasePaySplitter: account already has shares");

        _payees.push(account);
        _shares[account] = shares_;
        _totalShares += shares_;

        emit PayeeAdded(account, shares_);
    }
}
