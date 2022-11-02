"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.load = void 0;
const accounts_1 = require("./accounts");
const env_1 = __importDefault(require("../env"));
const log_1 = require("../log");
const fs_lib_1 = require("../fs_lib");
const web3_js_1 = require("@solana/web3.js");
function matchName(name, config) {
    switch (name) {
        case "staking":
            return new accounts_1.EProgram(env_1.default.StakeProgram);
        case "system":
            return new accounts_1.EProgram(env_1.default.SystemProgram);
        case "Collection":
            return new accounts_1.EAccount(new web3_js_1.PublicKey(config.collection));
        case "SystemProgram":
            return new accounts_1.EProgram(env_1.default.SystemProgram);
        case "TokenProgram":
            return new accounts_1.EProgram(env_1.default.TokenProgram);
        case "AssociatedProgram":
            return new accounts_1.EProgram(env_1.default.AssociatedProgram);
        case "MetadataProgram":
            return new accounts_1.EProgram(env_1.default.MetadataProgram);
        case "Sysvar":
            return new accounts_1.EProgram(env_1.default.Sysvar);
        case "Instance":
            return new accounts_1.EAccount(new web3_js_1.PublicKey(config.instance));
        case "Loader":
            return accounts_1.EWallet.fromFile("loader-keypair", "loader");
        case "HashList":
            return accounts_1.EWallet.fromFile("hash_list-keypair", "hash_list");
        case "RewardDescriptor":
            return accounts_1.EWallet.fromFile("reward_descriptor-keypair", "reward_descriptor");
        case "RewardList":
            return accounts_1.EWallet.fromFile("reward_list-keypair", "reward_list");
    }
    log_1.Log.Flow("Cannot find account: " + name, 2);
    throw ("Cannot find account: " + name);
}
function load(names) {
    const config = fs_lib_1.Load.config();
    const namespace = new Map();
    names.forEach((name) => {
        if (name === "")
            return;
        namespace.set(name, matchName(name, config));
    });
    log_1.Log.Flow("Required accounts loaded", 4);
    return namespace;
}
exports.load = load;
