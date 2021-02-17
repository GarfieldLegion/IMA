
const init = require("./Init.js");

async function enableWhitelist(schainName) {
    console.log("Check whitelist is disabled: ", await init.LockAndDataForMainnetERC20.methods.withoutWhitelist(await init.web3Mainnet.utils.soliditySha3(schainName)).call());
    const enableWhitelistABI = await init.LockAndDataForMainnetERC20.methods.enableWhitelist(schainName).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, enableWhitelistABI, init.LockAndDataForMainnetERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check whitelist is disabled after transaction is disabled: ", await init.LockAndDataForMainnetERC20.methods.withoutWhitelist(init.web3Mainnet.utils.soliditySha3(schainName)).call());
    console.log("Exiting...");
    process.exit()
}

async function disableWhitelist(schainName) {
    console.log("Check whitelist is disabled: ", await init.LockAndDataForMainnetERC20.methods.withoutWhitelist(await init.web3Mainnet.utils.soliditySha3(schainName)).call());
    const disableWhitelistABI = await init.LockAndDataForMainnetERC20.methods.disableWhitelist(schainName).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, disableWhitelistABI, init.LockAndDataForMainnetERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check whitelist is disabled after transaction: ", await init.LockAndDataForMainnetERC20.methods.withoutWhitelist(init.web3Mainnet.utils.soliditySha3(schainName)).call());
    console.log("Exiting...");
    process.exit()
}

async function addERC20TokenByOwner(schainName, addressOfERC20OnMainnet) {
    console.log("Check is contract exist in map: ", await init.LockAndDataForMainnetERC20.methods.getSchainToERC20(schainName, addressOfERC20OnMainnet).call());
    const addERC20TokenByOwnerABI = await init.LockAndDataForMainnetERC20.methods.addERC20TokenByOwner(schainName, addressOfERC20OnMainnet).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, addERC20TokenByOwnerABI, init.LockAndDataForMainnetERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForMainnetERC20.methods.getSchainToERC20(schainName, addressOfERC20OnMainnet).call());
    console.log("Exiting...");
    process.exit()
}

async function sendERC20(addressOnMainnet, to, amount) {
    const sendABI = await init.LockAndDataForMainnetERC20.methods.sendERC20(addressOnMainnet, to, amount).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeyMainnet, "hex");
    const success = await init.sendTransaction(init.web3Mainnet, init.mainAccountMainnet, privateKeyB, sendABI, init.LockAndDataForMainnetERC20._address);
    console.log("Transaction was successful:", success);
}

if (process.argv[2] == 'enableWhitelist') {
    enableWhitelist(process.argv[3]);
} else if (process.argv[2] == 'disableWhitelist') {
    disableWhitelist(process.argv[3]);
} else if (process.argv[2] == 'addERC20TokenByOwner') {
    addERC20TokenByOwner(process.argv[3], process.argv[4]);
} else if (process.argv[2] == 'sendERC20') {
    sendERC20(process.argv[3], process.argv[4], process.argv[5]);
} else {
    console.log("Recheck name of function");
    process.exit();
}