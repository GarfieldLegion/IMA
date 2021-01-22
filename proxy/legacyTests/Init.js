require('dotenv').config();
const fileNameMainnet = process.env.FILENAME_MAINNET;
const fileNameSchain = process.env.FILENAME_SCHAIN;
const privateKeyMainnet = process.env.PRIVATE_KEY_FOR_ETHEREUM;
const privateKeySchain = process.env.PRIVATE_KEY_FOR_SCHAIN;
const endpointMainnet = process.env.URL_W3_ETHEREUM;
const endpointSchain = process.env.URL_W3_S_CHAIN;

const Web3 = require('web3');
const PrivateKeyProvider = require("@truffle/hdwallet-provider");
const Tx = require("ethereumjs-tx").Transaction;

const providerMainnet = new PrivateKeyProvider(privateKeyMainnet, endpointMainnet);
const providerSchain = new PrivateKeyProvider(privateKeySchain, endpointSchain);
const web3Mainnet = new Web3(providerMainnet);
const web3Schain = new Web3(providerSchain);

const mainAccountMainnet = process.env.ACCOUNT_ETHEREUM;
const mainAccountSchain = process.env.ACCOUNT_SCHAIN;

const jsonDataMainnet = require("../data/" + fileNameMainnet);
const jsonDataSchain = require("../data/" + fileNameSchain);

module.exports.DepositBox = new web3Mainnet.eth.Contract(jsonDataMainnet['deposit_box_abi'], jsonDataMainnet['deposit_box_address']);
module.exports.LockAndDataForMainnet = new web3Mainnet.eth.Contract(jsonDataMainnet['lock_and_data_for_mainnet_abi'], jsonDataMainnet['lock_and_data_for_mainnet_address']);
module.exports.LockAndDataForMainnetERC20 = new web3Mainnet.eth.Contract(jsonDataMainnet['lock_and_data_for_mainnet_erc20_abi'], jsonDataMainnet['lock_and_data_for_mainnet_erc20_address']);
module.exports.LockAndDataForMainnetERC721 = new web3Mainnet.eth.Contract(jsonDataMainnet['lock_and_data_for_mainnet_erc721_abi'], jsonDataMainnet['lock_and_data_for_mainnet_erc721_address']);
module.exports.ERC20ModuleForMainnet = new web3Mainnet.eth.Contract(jsonDataMainnet['erc20_module_for_mainnet_abi'], jsonDataMainnet['erc20_module_for_mainnet_address']);
module.exports.ERC721ModuleForMainnet = new web3Mainnet.eth.Contract(jsonDataMainnet['erc721_module_for_mainnet_abi'], jsonDataMainnet['erc721_module_for_mainnet_address']);
module.exports.MessageProxyForMainnet = new web3Mainnet.eth.Contract(jsonDataMainnet['message_proxy_mainnet_abi'], jsonDataMainnet['message_proxy_mainnet_address']);

module.exports.TokenManager = new web3Schain.eth.Contract(jsonDataSchain['token_manager_abi'], jsonDataSchain['token_manager_address']);
module.exports.LockAndDataForSchain = new web3Schain.eth.Contract(jsonDataSchain['lock_and_data_for_schain_abi'], jsonDataSchain['lock_and_data_for_schain_address']);
module.exports.LockAndDataForSchainERC20 = new web3Schain.eth.Contract(jsonDataSchain['lock_and_data_for_schain_erc20_abi'], jsonDataSchain['lock_and_data_for_schain_erc20_address']);
module.exports.LockAndDataForSchainERC721 = new web3Schain.eth.Contract(jsonDataSchain['lock_and_data_for_schain_erc721_abi'], jsonDataSchain['lock_and_data_for_schain_erc721_address']);
module.exports.ERC20ModuleForSchain = new web3Schain.eth.Contract(jsonDataSchain['erc20_module_for_schain_abi'], jsonDataSchain['erc20_module_for_schain_address']);
module.exports.ERC721ModuleForSchain = new web3Schain.eth.Contract(jsonDataSchain['erc721_module_for_schain_abi'], jsonDataSchain['erc721_module_for_schain_address']);
module.exports.MessageProxyForSchain = new web3Schain.eth.Contract(jsonDataSchain['message_proxy_chain_abi'], jsonDataSchain['message_proxy_chain_address']);

async function sendTransaction(web3Inst, account, privateKey, data, receiverContract) {
    console.log("Transaction generating started!");
    const nonce = await web3Inst.eth.getTransactionCount(account);
    const rawTx = {
        from: web3Inst.utils.toChecksumAddress(account),
        nonce: "0x" + nonce.toString(16),
        data: data,
        to: receiverContract,
        gasPrice: 10000000000,
        gas: 8000000
        // chainId: await web3Inst.eth.getChainId()
    };
    const tx = new Tx(rawTx, {chain: "rinkeby"});
    tx.sign(privateKey);
    const serializedTx = tx.serialize();
    const txReceipt = await web3Inst.eth.sendSignedTransaction('0x' + serializedTx.toString('hex')); //.on('receipt', receipt => {
    // console.log("Transaction receipt is - ");
    // console.log(txReceipt);
    // console.log();
    return true;
}

module.exports.web3Mainnet = web3Mainnet;
module.exports.web3Schain = web3Schain;
module.exports.mainAccountMainnet = mainAccountMainnet;
module.exports.mainAccountSchain = mainAccountSchain;
module.exports.jsonDataMainnet = jsonDataMainnet;
module.exports.jsonDataSchain = jsonDataSchain;
module.exports.privateKeyMainnet = privateKeyMainnet;
module.exports.privateKeySchain = privateKeySchain;
module.exports.sendTransaction = sendTransaction;