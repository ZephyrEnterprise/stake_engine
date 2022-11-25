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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify = exports.parseRewardList = exports.parseRewardDescriptor = exports.parseHashList = void 0;
const web3_js_1 = require("@solana/web3.js");
const path_1 = __importDefault(require("path"));
const bn_js_1 = __importDefault(require("bn.js"));
const big_byte_1 = require("../big-byte");
const state_operator_1 = require("../state_operator");
const fs_lib_1 = require("../fs_lib");
const env_1 = __importDefault(require("../env"));
function parseHashList(record) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = (yield env_1.default.connection._.getAccountInfo(record)).data;
            const size = (new bn_js_1.default(data.slice(28, 32), "le").toNumber());
            let hashes = [];
            for (let i = 0; i < size; i++) {
                hashes.push((new web3_js_1.PublicKey(data.slice(32 + i * 32, 64 + i * 32))).toBase58());
            }
            return {
                size: size,
                hashes: hashes
            };
        }
        catch (e) {
            throw "Can not find HashList";
        }
    });
}
exports.parseHashList = parseHashList;
function parseRewardDescriptor(record, size) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = (yield env_1.default.connection._.getAccountInfo(record)).data;
            let pos = [];
            for (let i = 0; i < size; i++) {
                pos.push(new bn_js_1.default(data.slice(32 + i, 33 + i), "le").toNumber());
            }
            return {
                size: size,
                array: pos
            };
        }
        catch (e) {
            throw "Can not find Reward Descriptor";
        }
    });
}
exports.parseRewardDescriptor = parseRewardDescriptor;
function parseRewardList(record, depositCount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = (yield env_1.default.connection._.getAccountInfo(record)).data;
            let rewards = [];
            for (let i = 0; i < 256; i++) {
                let row = [];
                for (let j = 0; j < depositCount; j++) {
                    row.push((0, big_byte_1.fromLittleEndian)(data.slice(32 + j * 8 + i * (8 * depositCount), 40 + j * 8 + i * (8 * depositCount))).toString());
                }
                rewards.push(row);
            }
            return {
                array: rewards
            };
        }
        catch (e) {
            throw "Can not find Reward List";
        }
    });
}
exports.parseRewardList = parseRewardList;
function packConfig() {
    const config = fs_lib_1.Load.config();
    const hashList = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "hash_list.json"));
    const client_config = {
        web: config.web,
        owner: config.owner,
        instance: config.instance,
        mint: config.mint,
        hashList: config.hash_list,
        rewardDescriptor: config.reward_descriptor,
        rewardList: config.reward_list,
        tokens: config.tokens,
        decimals: config.decimals,
        hashes: hashList.hashes
    };
    fs_lib_1.Write.Json(client_config, path_1.default.resolve(fs_lib_1.Path.dataDir, "client_config.json"));
}
function verify() {
    return __awaiter(this, void 0, void 0, function* () {
        fs_lib_1.Flush.file("client_config.json");
        const state = state_operator_1.State.get();
        const config = fs_lib_1.Load.config();
        const hashList = yield parseHashList(new web3_js_1.PublicKey(config.hash_list));
        const rewardDescriptor = yield parseRewardDescriptor(new web3_js_1.PublicKey(config.reward_descriptor), hashList.size);
        const rewardList = yield parseRewardList(new web3_js_1.PublicKey(config.reward_list), config.tokens.length);
        const hashListTarget = yield fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "hash_list.json"));
        const rewardDescriptorTarget = yield fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
        const rewardListTarget = yield fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
        if (JSON.stringify(hashList) !== JSON.stringify(hashListTarget)) {
            throw "HashList not match target value";
        }
        if (JSON.stringify(rewardDescriptor) !== JSON.stringify(rewardDescriptorTarget)) {
            throw "RewardDescriptor not match target value";
        }
        if (JSON.stringify(rewardList) !== JSON.stringify(rewardListTarget)) {
            throw "RewardList not match target value";
        }
        state.map.get("EVM").state = "none";
        state.map.get("EVM").script = "";
        state.setVerified(true);
        packConfig();
        fs_lib_1.Flush.initScripts();
        fs_lib_1.Flush.writeScripts();
        return { res: true, msg: "Verified" };
    });
}
exports.verify = verify;
