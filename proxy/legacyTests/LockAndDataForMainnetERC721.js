const init = require("./Init.js");

async function enableWhitelist(schainName) {
    console.log("Check whitelist is disabled: ", await init.LockAndDataForMainnetERC20.methods.withoutWhitelist(await init.web3Mainnet.utils.soliditySha3(schainName)).call());
    const enableWhitelistABI = await init.LockAndDataForMainnetERC721.methods.enableWhitelist(schainName).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, enableWhitelistABI, init.LockAndDataForMainnetERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check whitelist is disabled after transaction is disabled: ", await init.LockAndDataForMainnetERC721.methods.withoutWhitelist(init.web3Mainnet.utils.soliditySha3(schainName)).call());
    console.log("Exiting...");
    process.exit()
}

async function disableWhitelist(schainName) {
    console.log("Check whitelist is disabled: ", await init.LockAndDataForMainnetERC721.methods.withoutWhitelist(await init.web3Mainnet.utils.soliditySha3(schainName)).call());
    const disableWhitelistABI = await init.LockAndDataForMainnetERC721.methods.disableWhitelist(schainName).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, disableWhitelistABI, init.LockAndDataForMainnetERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check whitelist is disabled after transaction: ", await init.LockAndDataForMainnetERC721.methods.withoutWhitelist(init.web3Mainnet.utils.soliditySha3(schainName)).call());
    console.log("Exiting...");
    process.exit()
}

async function addERC721TokenByOwner(schainName, addressOfERC721OnMainnet) {
    console.log("Check is contract exist in map: ", await init.LockAndDataForMainnetERC721.methods.getSchainToERC721(schainName, addressOfERC721OnMainnet).call());
    const addERC721TokenByOwnerABI = await init.LockAndDataForMainnetERC721.methods.addERC721TokenByOwner(schainName, addressOfERC721OnMainnet).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, addERC721TokenByOwnerABI, init.LockAndDataForMainnetERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForMainnetERC721.methods.getSchainToERC721(schainName, addressOfERC721OnMainnet).call());
    console.log("Exiting...");
    process.exit()
}

if (process.argv[2] == 'enableWhitelist') {
    enableWhitelist(process.argv[3]);
} else if (process.argv[2] == 'disableWhitelist') {
    disableWhitelist(process.argv[3]);
} else if (process.argv[2] == 'addERC721TokenByOwner') {
    addERC721TokenByOwner(process.argv[3], process.argv[4]);
} else {
    console.log("Recheck name of function");
    process.exit();
}