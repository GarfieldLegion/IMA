// SPDX-License-Identifier: AGPL-3.0-only

/**
 *   DepositBoxERC721.sol - SKALE Interchain Messaging Agent
 *   Copyright (C) 2021-Present SKALE Labs
 *   @author Artem Payvin
 *
 *   SKALE IMA is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU Affero General Public License as published
 *   by the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   SKALE IMA is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU Affero General Public License for more details.
 *
 *   You should have received a copy of the GNU Affero General Public License
 *   along with SKALE IMA.  If not, see <https://www.gnu.org/licenses/>.
 */

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

import "./IMAConnected.sol";
import "./Messages.sol";


// This contract runs on the main net and accepts deposits


contract DepositBoxERC721 is IMAConnected {

    // uint256 public gasConsumption;

    mapping(bytes32 => address) public tokenManagerERC721Addresses;

    mapping(bytes32 => mapping(address => bool)) public schainToERC721;
    mapping(bytes32 => bool) public withoutWhitelist;

    /**
     * @dev Emitted when token is mapped in LockAndDataForMainnetERC721.
     */
    event ERC721TokenAdded(string schainID, address indexed contractOnMainnet);
    event ERC721TokenReady(address indexed contractOnMainnet, uint256 tokenId);

    modifier rightTransaction(string memory schainID) {
        require(
            keccak256(abi.encodePacked(schainID)) != keccak256(abi.encodePacked("Mainnet")),
            "SKALE chain name is incorrect"
        );
        _;
    }

    // modifier receivedEth() {
    //     _;
    //     if (msg.value > 0) {
    //         LockAndDataForMainnet(lockAndDataAddress_).receiveEth{value: msg.value}(msg.sender);
    //     }
    // }

    // receive() external payable {
    //     revert("Use deposit function");
    // }

    // function depositERC20(
    //     string calldata schainID,
    //     address contractOnMainnet,
    //     address to,
    //     uint256 amount
    // )
    //     external
    //     payable
    //     rightTransaction(schainID)
    //     receivedEth
    // {
    //     bytes32 schainHash = keccak256(abi.encodePacked(schainID));
    //     address tokenManagerAddress = LockAndDataForMainnet(lockAndDataAddress_).tokenManagerAddresses(schainHash);
    //     require(tokenManagerAddress != address(0), "Unconnected chain");
    //     require(
    //         IERC20Upgradeable(contractOnMainnet).transferFrom(
    //             msg.sender,
    //             IContractManager(lockAndDataAddress_).getContract("LockAndDataERC20"),
    //             amount
    //         ),
    //         "Could not transfer ERC20 Token"
    //     );
    //     bytes memory data = ERC20ModuleForMainnet(
    //         IContractManager(lockAndDataAddress_).getContract("ERC20Module")
    //     ).receiveERC20(
    //         schainID,
    //         contractOnMainnet,
    //         to,
    //         amount
    //     );
    //     IMessageProxy(IContractManager(lockAndDataAddress_).getContract("MessageProxy")).postOutgoingMessage(
    //         schainID,
    //         tokenManagerAddress,
    //         msg.value,
    //         address(0),
    //         data
    //     );
    // }

    function depositERC721(
        string calldata schainID,
        address contractOnMainnet,
        address to,
        uint256 tokenId
    )
        external
        payable
        rightTransaction(schainID)
        receivedEth
    {
        bytes32 schainHash = keccak256(abi.encodePacked(schainID));
        address tokenManagerAddress = tokenManagerAddresses[schainHash];
        require(tokenManagerAddress != address(0), "Unconnected chain");
        require(
            IERC721Upgradeable(contractOnMainnet).ownerOf(tokenId) == address(this),
            "Did not transfer ERC721 token"
        );
        bytes memory data = _receiveERC721(
            schainID,
            contractOnMainnet,
            to,
            tokenId
        );
        messageProxy.postOutgoingMessage(
            schainID,
            tokenManagerAddress,
            msg.value,
            address(0),
            data
        );
    }

    /**
     * @dev Adds a TokenManagerERC20 address to
     * DepositBoxERC20.
     *
     * Requirements:
     *
     * - `msg.sender` must be schain owner or contract owner.
     * - SKALE chain must not already be added.
     * - TokenManager address must be non-zero.
     */
    function addTokenManagerERC721(string calldata schainID, address newTokenManagerERC721Address) external {
        require(
            isSchainOwner(msg.sender, keccak256(abi.encodePacked(schainID))) ||
            msg.sender == owner(), "Not authorized caller"
        );
        bytes32 schainHash = keccak256(abi.encodePacked(schainID));
        require(tokenManagerERC721Addresses[schainHash] == address(0), "SKALE chain is already set");
        require(newTokenManagerERC721Address != address(0), "Incorrect Token Manager address");
        tokenManagerERC721Addresses[schainHash] = newTokenManagerERC721Address;
    }

    /**
     * @dev Allows Owner to remove a TokenManagerERC20 on SKALE chain
     * from DepositBoxERC20.
     *
     * Requirements:
     *
     * - `msg.sender` must be schain owner or contract owner
     * - SKALE chain must already be set.
     */
    function removeTokenManagerERC721(string calldata schainID) external {
        require(
            isSchainOwner(msg.sender, keccak256(abi.encodePacked(schainID))) ||
            msg.sender == owner(), "Not authorized caller"
        );
        bytes32 schainHash = keccak256(abi.encodePacked(schainID));
        require(tokenManagerERC721Addresses[schainHash] != address(0), "SKALE chain is not set");
        delete tokenManagerERC721Addresses[schainHash];
    }

    function postMessage(
        string calldata fromSchainID,
        address sender,
        address to,
        uint256 amount,
        bytes calldata data
    )
        external
        onlyMessageProxy
        returns (bool)
    {
        require(data.length != 0, "Invalid data");
        bytes32 schainHash = keccak256(abi.encodePacked(fromSchainID));
        require(
            schainHash != keccak256(abi.encodePacked("Mainnet")) &&
            sender == LockAndDataForMainnet(lockAndDataAddress_).tokenManagerAddresses(schainHash),
            "Receiver chain is incorrect"
        );
        Messages.MessageType operation = Messages.getMessageType(data);
        // TODO add gas reimbusement
        // uint256 txFee = gasConsumption * tx.gasprice;
        // require(amount >= txFee, "Not enough funds to recover gas");
        if (operation == Messages.MessageType.TRANSFER_ERC721) {
            require(_sendERC721(data), "Sending of ERC721 was failed");
        } else {
            revert("MessageType is unknown");
        }
        // TODO add gas reimbusement
        // imaLinker.rechargeSchainWallet(schainId, txFee);
        return true;
    }

    /**
     * @dev Allows Schain owner to add an ERC721 token to LockAndDataForMainnetERC20.
     */
    function addERC721TokenByOwner(string calldata schainName, address erc721OnMainnet) external {
        bytes32 schainId = keccak256(abi.encodePacked(schainName));
        require(isSchainOwner(msg.sender, schainId) || msg.sender == getOwner(), "Sender is not a Schain owner");
        require(erc721OnMainnet.isContract(), "Given address is not a contract");
        // require(!withoutWhitelist[schainId], "Whitelist is enabled");
        schainToERC721[schainId][erc20OnMainnet] = true;
        emit ERC721TokenAdded(schainName, erc721OnMainnet);
    }

    /**
     * @dev Allows Schain owner turn on whitelist of tokens.
     */
    function enableWhitelist(string memory schainName) external {
        require(isSchainOwner(msg.sender, keccak256(abi.encodePacked(schainName))), "Sender is not a Schain owner");
        withoutWhitelist[keccak256(abi.encodePacked(schainName))] = false;
    }

    /**
     * @dev Allows Schain owner turn off whitelist of tokens.
     */
    function disableWhitelist(string memory schainName) external {
        require(isSchainOwner(msg.sender, keccak256(abi.encodePacked(schainName))), "Sender is not a Schain owner");
        withoutWhitelist[keccak256(abi.encodePacked(schainName))] = true;
    }

    /**
     * @dev Should return true if token in whitelist.
     */
    function getSchainToERC721(string calldata schainName, address erc721OnMainnet) external view returns (bool) {
        return schainToERC721[keccak256(abi.encodePacked(schainName))][erc721OnMainnet];
    }

    /**
     * @dev Checks whether depositBoxERC721 is connected to a SKALE chain TokenManagerERC721.
     */
    function hasTokenManagerERC721(string calldata schainID) external view returns (bool) {
        return tokenManagerERC721Addresses[keccak256(abi.encodePacked(schainID))] != address(0);
    }

    /// Create a new deposit box
    function initialize(
        address newIMALinkerAddress,
        address newContractManagerOfSkaleManager,
        address newMessageProxyAddress
    )
        public
        override
        initializer
    {
        IMAConnected.initialize(newIMALinkerAddress, newContractManagerOfSkaleManager, newMessageProxyAddress);
        // gasConsumption = 500000;
    }

    // function deposit(string memory schainID, address to)
    //     public
    //     payable
    //     rightTransaction(schainID)
    //     receivedEth
    // {
    //     bytes32 schainHash = keccak256(abi.encodePacked(schainID));
    //     address tokenManagerAddress = LockAndDataForMainnet(lockAndDataAddress_).tokenManagerAddresses(schainHash);
    //     require(tokenManagerAddress != address(0), "Unconnected chain");
    //     require(to != address(0), "Community Pool is not available");
    //     IMessageProxy(IContractManager(lockAndDataAddress_).getContract("MessageProxy")).postOutgoingMessage(
    //         schainID,
    //         tokenManagerAddress,
    //         msg.value,
    //         to,
    //         Messages.encodeTransferEthMessage()
    //     );
    // }

    /**
     * @dev Allows DepositBox to receive ERC721 tokens.
     * 
     * Emits an {ERC721TokenAdded} event.  
     */
    function _receiveERC721(
        string calldata schainID,
        address contractOnMainnet,
        address to,
        uint256 tokenId
    )
        external
        returns (bytes memory data)
    {
        bool isERC721AddedToSchain = schainToERC721[keccak256(abi.encodePacked(schainName))][erc721OnMainnet];
        if (!isERC721AddedToSchain) {
            _addERC721ForSchain(schainID, contractOnMainnet);
            emit ERC721TokenAdded(schainID, contractOnMainnet);
            data = Messages.encodeTransferErc721AndTokenInfoMessage(
                contractOnMainnet,
                to,
                tokenId,
                _getTokenInfo(IERC721MetadataUpgradeable(contractOnMainnet))
            );
        } else {
            data = Messages.encodeTransferErc721Message(contractOnMainnet, to, tokenId);
        }
        emit ERC721TokenReady(contractOnMainnet, tokenId);
    }

    /**
     * @dev Allows DepositBox to send ERC721 tokens.
     */
    function _sendERC721(bytes calldata data) external allow("DepositBox") returns (bool) {
        Messages.TransferErc721Message memory message = Messages.decodeTransferErc721Message(data);
        require(message.token.isContract(), "Given address is not a contract");
        require(IERC721Upgradeable(message.token).ownerOf(message.tokenId) == address(this), "Incorrect tokenId");
        IERC721Upgradeable(message.token).transferFrom(address(this), message.receiver, message.tokenId);
        return true;
    }

    /**
     * @dev Allows ERC721ModuleForMainnet to add an ERC721 token to
     * LockAndDataForMainnetERC721.
     */
    function _addERC721ForSchain(string calldata schainName, address erc721OnMainnet) external allow("ERC721Module") {
        bytes32 schainId = keccak256(abi.encodePacked(schainName));
        require(erc721OnMainnet.isContract(), "Given address is not a contract");
        require(withoutWhitelist[schainId], "Whitelist is enabled");
        schainToERC721[schainId][erc721OnMainnet] = true;
        emit ERC721TokenAdded(schainName, erc721OnMainnet);
    }

    function _getTokenInfo(IERC721MetadataUpgradeable erc721) internal view returns (Messages.Erc721TokenInfo memory) {
        return Messages.Erc721TokenInfo({
            name: erc721.name(),
            symbol: erc721.symbol()
        });
    }

    // function _executePerOperation(
    //     bytes32 schainId,
    //     address to,
    //     uint256 amount,
    //     bytes calldata data    
    // )
    //     private
    // {
    //     Messages.MessageType operation = Messages.getMessageType(data);
    //     uint256 txFee = gasConsumptions[operation] * tx.gasprice;
    //     require(amount >= txFee, "Not enough funds to recover gas");
    //     if (operation == Messages.MessageType.TRANSFER_ETH) {
    //         if (amount > txFee) {
    //             LockAndDataForMainnet(lockAndDataAddress_).approveTransfer(
    //                 to,
    //                 amount - txFee
    //             );
    //         }
    //     } else if (operation == Messages.MessageType.TRANSFER_ERC20) {
    //         address erc20Module = IContractManager(lockAndDataAddress_).getContract(
    //             "ERC20Module"
    //         );
    //         require(ERC20ModuleForMainnet(erc20Module).sendERC20(data), "Sending of ERC20 was failed");
    //         address receiver = ERC20ModuleForMainnet(erc20Module).getReceiver(data);
    //         if (amount > txFee)
    //             LockAndDataForMainnet(lockAndDataAddress_).approveTransfer(
    //                 receiver,
    //                 amount - txFee
    //             );
    //     } else if (operation == Messages.MessageType.TRANSFER_ERC721) {
    //         address erc721Module = IContractManager(lockAndDataAddress_).getContract(
    //             "ERC721Module"
    //         );
    //         require(ERC721ModuleForMainnet(erc721Module).sendERC721(data), "Sending of ERC721 was failed");
    //         address receiver = ERC721ModuleForMainnet(erc721Module).getReceiver(data);
    //         if (amount > txFee)
    //             LockAndDataForMainnet(lockAndDataAddress_).approveTransfer(
    //                 receiver,
    //                 amount - txFee
    //             );
    //     } else {
    //         revert("MessageType is unknown");
    //     }
    //     LockAndDataForMainnet(lockAndDataAddress_).rechargeSchainWallet(schainId, txFee);
    // }
}
