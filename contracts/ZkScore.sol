// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";


/// @title ZkScore
/// @author Team ZkScore
/// @notice contract to have and manage address score identity

contract ZkScore is Ownable, ERC721Enumerable{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // user address to hash root of current reputation
    mapping(address => bytes32) public userIdentityState;
    
    // user address to H(user.address, null)
    mapping(address => bytes32) public userAddressHash;

    // tokenId to claim hash
    mapping(uint256 => bytes32) public claimOftokenId;

    // can be implemented by homomorphic encryption
    // mapping(address => uint) public scores;

    // hash of zero score for address initialization 
    bytes32 public zeroHash;

    constructor() ERC721("Zk Score", "ZKS") Ownable(){
        zeroHash = keccak256(abi.encodePacked("0"));
    }

    /**
    * @dev Another contract cannot add reputation, register, change state. 
    */
    modifier onlyEOA(address addr) {
        require(!Address.isContract(addr), "Address must be EOA");
        _;
    }

    /**
    * @dev Conract cannot generate genesis state if user is already registered
    */
    modifier onlyNotRegister {
        require(userAddressHash[msg.sender] == 0, "You already registered");
        _;
    }

    /**
    * @dev Conract cannot add reputation for non-registered address and self address
    */
    modifier onlyValidAddress(address to) {
        require(userAddressHash[to] != 0, "Recipients has not registered yet");
        require(to != msg.sender, "You cannot add reputation to yourself");
        _;
    }

    /**
    * @dev Conract cannot generate genesis state if user is already registered
    */
    function firstResister() external onlyNotRegister onlyEOA(msg.sender) {
        address addr = msg.sender;
        bytes32 addrHash = keccak256(abi.encodePacked(addr));
        userAddressHash[addr] = addrHash;
        userIdentityState[addr] = _efficientHash(zeroHash, addrHash);
        safeMint(addr);
    }

    /**
    * @dev calculate root of merkel tree and update mapping state
    */
    function mint(address to, bytes32 hashedScore) external onlyValidAddress(to) onlyEOA(msg.sender) onlyEOA(to){
        bytes32 reputation = _efficientHash(hashedScore, userAddressHash[to]);
        userIdentityState[to] =  _efficientHash(userIdentityState[to], reputation);
        safeMint(to);
    }

    function safeMint(address to) internal {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        claimOftokenId[tokenId] = userIdentityState[to];
    }

    /**
    * @dev we also override this to prohibit approve func
    */    
    function approve(address to, uint256 tokenId) public override(IERC721, ERC721){
        require(false, "Err: token is SOUL BOUND"); // better?? => revert CustomError()
        super.approve(to, tokenId);
    }

    /**
    * @dev Maybe custom error is better approch??
    */    
    function setApprovalForAll(address operator, bool approved) public override(IERC721, ERC721){
        require(false, "Err: token is SOUL BOUND"); // better?? => revert CustomError()
        super.setApprovalForAll(operator, approved);
    }

    /**
    * @dev we override this to make it sould bound token, non-transferable
    */    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721Enumerable) {
        require(from == address(0), "Err: token is SOUL BOUND");
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
    * @dev return whether the address have genesis state (registered) or not
    */
    function isRegistered(address addr) public view returns (bool) {
        return userAddressHash[addr] != 0; 
    }

    /**
    * @dev inline assembly is more efficient than abi.encodePacked()??
    */
    function _efficientHash(bytes32 leftNode, bytes32 rightNode) private pure returns (bytes32 hashedValue)
    {
        assembly {
            mstore(0x00, leftNode)
            mstore(0x20, rightNode)
            hashedValue := keccak256(0x00, 0x40)
        }
    }
}
