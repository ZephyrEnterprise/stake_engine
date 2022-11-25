"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const web3_js_1 = require("@solana/web3.js");
const fs_lib_1 = require("./fs_lib");
let connection = { _: new web3_js_1.Connection("https://api.devnet.solana.com") };
function switchConnection() {
    const config = fs_lib_1.Load.config();
    if (!config)
        throw "Error while loading config";
    switch (config.web) {
        case "mainnet":
            connection._ = new web3_js_1.Connection("https://api.mainnet-beta.solana.com");
            break;
        case "devnet":
            connection._ = new web3_js_1.Connection("https://api.devnet.solana.com");
            break;
        case "testnet":
            connection._ = new web3_js_1.Connection("https://api.testnet.solana.com");
            break;
    }
}
const StakeProgram = new web3_js_1.PublicKey("StaXxEPJNmvNzXox4WpsGkeVCieKV1bNrYnCQybaSnQ");
const SystemProgram = new web3_js_1.PublicKey("11111111111111111111111111111111");
const TokenProgram = new web3_js_1.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const MetadataProgram = new web3_js_1.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const AssociatedProgram = new web3_js_1.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const Sysvar = new web3_js_1.PublicKey("SysvarRent111111111111111111111111111111111");
const Royalty = new web3_js_1.PublicKey("8rHBigEN7xpo27PzvMn9zRN2MLU86C5jhzwDZLEMvSJD");
const PORT = 3001;
const txFee = 1000000;
exports.default = { switchConnection, connection, StakeProgram, SystemProgram, TokenProgram, MetadataProgram, AssociatedProgram, Sysvar,
    PORT, txFee, Royalty };
