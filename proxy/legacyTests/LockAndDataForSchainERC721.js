const init = require("./Init.js");

// async function enableAutomaticDeploy(schainName) {
//     console.log("Check automatic deploy is disabled: ", await init.LockAndDataForSchainERC721.methods.withoutWhitelist(await init.web3Schain.utils.soliditySha3(schainName)).call());
//     const enableWhitelistABI = await init.LockAndDataForSchainERC721.methods.enableAutomaticDeploy(schainName).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, enableWhitelistABI, init.LockAndDataForSchainERC721._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check automatic deploy is disabled after transaction is disabled: ", await init.LockAndDataForSchainERC721.methods.withoutWhitelist(init.web3Schain.utils.soliditySha3(schainName)).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function enableAutomaticDeployFromMainnet() {
    console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3("Mainnet")).call());
    const enableAutomaticDeployABI = await init.LockAndDataForSchainERC721.methods.enableAutomaticDeploy("Mainnet").encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, enableAutomaticDeployABI, init.LockAndDataForSchainERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check automatic deploy is enabled after transaction is disabled: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(init.web3Schain.utils.soliditySha3("Mainnet")).call());
    console.log("Exiting...");
    process.exit()
}

// async function disableAutomaticDeploy(schainName) {
//     console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3(schainName)).call());
//     const disableAutomaticDeployABI = await init.LockAndDataForSchainERC721.methods.disableAutomaticDeploy(schainName).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, disableAutomaticDeployABI, init.LockAndDataForSchainERC721._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check automatic deploy is enabled after transaction: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(init.web3Schain.utils.soliditySha3(schainName)).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function disableAutomaticDeployFromMainnet() {
    console.log("Check automatic deploy is enabled: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(await init.web3Schain.utils.soliditySha3("Mainnet")).call());
    const disableAutomaticDeployABI = await init.LockAndDataForSchainERC721.methods.disableAutomaticDeploy("Mainnet").encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, disableAutomaticDeployABI, init.LockAndDataForSchainERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check automatic deploy is enabled after transaction: ", await init.LockAndDataForSchainERC721.methods.automaticDeploy(init.web3Schain.utils.soliditySha3("Mainnet")).call());
    console.log("Exiting...");
    process.exit()
}

// async function addERC721TokenByOwner(schainName, addressOfERC721OnMainnet, addressOfERC721OnSchain) {
//     console.log("Check is contract exist in map: ", await init.LockAndDataForSchainERC721.methods.getERC721OnSchain(schainName, addressOfERC721OnMainnet).call());
//     const addERC721TokenByOwnerABI = await init.LockAndDataForSchainERC721.methods.addERC721TokenByOwner(schainName, addressOfERC721OnMainnet, addressOfERC721OnSchain).encodeABI();
//     const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
//     const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, addERC721TokenByOwnerABI, init.LockAndDataForSchainERC721._address);
//     console.log("Transaction was successful:", success);
//     console.log();
//     console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForSchainERC721.methods.getERC721OnSchain(schainName, addressOfERC721OnMainnet).call());
//     console.log("Exiting...");
//     process.exit()
// }

async function addERC721TokenByOwnerFromMainnet(addressOfERC721OnMainnet, addressOfERC721OnSchain) {
    console.log("Check is contract exist in map: ", await init.LockAndDataForSchainERC721.methods.getERC721OnSchain("Mainnet", addressOfERC721OnMainnet).call());
    const addERC721TokenByOwnerABI = await init.LockAndDataForSchainERC721.methods.addERC721TokenByOwner("Mainnet", addressOfERC721OnMainnet, addressOfERC721OnSchain).encodeABI();
    const privateKeyB = Buffer.from(init.privateKeySchain, "hex");
    const success = await init.sendTransaction(init.web3Schain, init.mainAccountSchain, privateKeyB, addERC721TokenByOwnerABI, init.LockAndDataForSchainERC721._address);
    console.log("Transaction was successful:", success);
    console.log();
    console.log("Check is contract exist in map after transaction: ", await init.LockAndDataForSchainERC721.methods.getERC721OnSchain("Mainnet", addressOfERC721OnMainnet).call());
    console.log("Exiting...");
    process.exit()
}

if (process.argv[2] == 'enableAutomaticDeployFromMainnet') {
    enableAutomaticDeployFromMainnet();
} else if (process.argv[2] == 'disableAutomaticDeployFromMainnet') {
    disableAutomaticDeployFromMainnet();
} else if (process.argv[2] == 'addERC721TokenByOwnerFromMainnet') {
    addERC721TokenByOwnerFromMainnet(process.argv[3], process.argv[4]);
} else {
    console.log("Recheck name of function");
    process.exit();
}