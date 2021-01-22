const init = require("./Init.js");

// async function enableAutomaticDeploy(schainName) {
//     console.log("Check automatic deploy is disabled: ", await init.LockAndDataForSchainERC20.methods.withoutWhitelist(await init.web3Schain.utils.soliditySha3(schainName)).call());
//     const enableWhitelistABI = await init.LockAndDataForSchainERC20.methods.enableAutomaticDeploy(schainName).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, enableWhitelistABI, init.LockAndDataForSchainERC20._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check automatic deploy is disabled after transaction is disabled: ", await init.LockAndDataForSchainERC20.methods.withoutWhitelist(init.web3Schain.utils.soliditySha3(schainName)).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function enableAutomaticDeployFromMainnet() {
    console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3("Mainnet")).call());
    const enableAutomaticDeployABI = await init.LockAndDataForSchainERC20.methods.enableAutomaticDeploy("Mainnet").encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, enableAutomaticDeployABI, init.LockAndDataForSchainERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check automatic deploy is enabled after transaction is disabled: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(init.web3Schain.utils.soliditySha3("Mainnet")).call());
    console.log("Exiting...");
    process.exit()
}

// async function disableAutomaticDeploy(schainName) {
//     console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3(schainName)).call());
//     const disableAutomaticDeployABI = await init.LockAndDataForSchainERC20.methods.disableAutomaticDeploy(schainName).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, disableAutomaticDeployABI, init.LockAndDataForSchainERC20._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check automatic deploy is enabled after transaction: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(init.web3Schain.utils.soliditySha3(schainName)).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function disableAutomaticDeployFromMainnet() {
    console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3("Mainnet")).call());
    const disableAutomaticDeployABI = await init.LockAndDataForSchainERC20.methods.disableAutomaticDeploy("Mainnet").encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, disableAutomaticDeployABI, init.LockAndDataForSchainERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check automatic deploy is enabled after transaction: ", await init.LockAndDataForSchainERC20.methods.automaticDeploy(init.web3Schain.utils.soliditySha3("Mainnet")).call());
    console.log("Exiting...");
    process.exit()
}

// async function addERC20TokenByOwner(schainName, addressOfERC20OnMainnet, addressOfERC20OnSchain) {
//     console.log("Check is contract exist in map: ", await init.LockAndDataForSchainERC20.methods.getERC20OnSchain(schainName, addressOfERC20OnMainnet).call());
//     const addERC20TokenByOwnerABI = await init.LockAndDataForSchainERC20.methods.addERC20TokenByOwner(schainName, addressOfERC20OnMainnet, addressOfERC20OnSchain).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, addERC20TokenByOwnerABI, init.LockAndDataForSchainERC20._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForSchainERC20.methods.getERC20OnSchain(schainName, addressOfERC20OnMainnet).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function addERC20TokenByOwnerFromMainnet(addressOfERC20OnMainnet, addressOfERC20OnSchain) {
    console.log("Check is contract exist in map: ", await init.LockAndDataForSchainERC20.methods.getERC20OnSchain("Mainnet", addressOfERC20OnMainnet).call());
    const addERC20TokenByOwnerABI = await init.LockAndDataForSchainERC20.methods.addERC20TokenByOwner("Mainnet", addressOfERC20OnMainnet, addressOfERC20OnSchain).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, addERC20TokenByOwnerABI, init.LockAndDataForSchainERC20._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForSchainERC20.methods.getERC20OnSchain("Mainnet", addressOfERC20OnMainnet).call());
    console.log("Exiting...");
    process.exit()
}

if (process.argv[2] == 'enableAutomaticDeployFromMainnet') {
    enableAutomaticDeployFromMainnet();
} else if (process.argv[2] == 'disableAutomaticDeployFromMainnet') {
    disableAutomaticDeployFromMainnet();
} else if (process.argv[2] == 'addERC20TokenByOwnerFromMainnet') {
    addERC20TokenByOwnerFromMainnet(process.argv[3], process.argv[4]);
} else {
    console.log("Recheck name of function");
    process.exit();
}