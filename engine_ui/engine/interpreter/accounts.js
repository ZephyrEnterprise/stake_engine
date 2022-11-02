"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EProgram = exports.EWallet = exports.EAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_lib_1 = require("../fs_lib");
class EAccount {
    constructor(_pubKey) {
        this.pubKey = _pubKey;
    }
    address() {
        return this.pubKey;
    }
    accountMeta() {
        return {
            pubkey: this.address(),
            isSigner: false,
            isWritable: true,
        };
    }
    signTx(keys) {
        return keys;
    }
    static fromString(str) {
        return new EAccount(new web3_js_1.PublicKey(str));
    }
}
exports.EAccount = EAccount;
class EWallet {
    constructor(_keyPair) {
        this.keyPair = _keyPair;
    }
    address() {
        return this.keyPair.publicKey;
    }
    accountMeta() {
        return {
            pubkey: this.address(),
            isSigner: true,
            isWritable: true,
        };
    }
    signTx(keys) {
        keys.push(this.keyPair);
        return keys;
    }
    static fromFile(name, configName) {
        try {
            return new EWallet(fs_lib_1.Load.keypair(name));
        }
        catch (e) {
            const config = fs_lib_1.Load.config();
            return new EAccount(new web3_js_1.PublicKey(config[configName]));
        }
    }
    sendAndConfirmTransaction(transaction, connection, keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, keys, {
                skipPreflight: true,
                preflightCommitment: "confirmed",
            });
        });
    }
}
exports.EWallet = EWallet;
class EProgram {
    constructor(_pubKey) {
        this.pubKey = _pubKey;
    }
    address() {
        return this.pubKey;
    }
    accountMeta() {
        return {
            pubkey: this.address(),
            isSigner: false,
            isWritable: false,
        };
    }
    signTx(keys) {
        return keys;
    }
    static fromString(str) {
        return new EAccount(new web3_js_1.PublicKey(str));
    }
}
exports.EProgram = EProgram;
