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
exports.load = exports.configure = void 0;
const web3_js_1 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const path_1 = __importDefault(require("path"));
const fs_lib_1 = require("../fs_lib");
const log_1 = require("../log");
const translator_1 = require("../interpreter/translator");
const state_operator_1 = require("../state_operator");
const env_1 = __importDefault(require("../env"));
const bn_js_1 = __importDefault(require("bn.js"));
const big_byte_1 = require("../big-byte");
const upload_verificator_1 = require("./upload_verificator");
function createKeys(config) {
    const hashList = new web3_js_1.Keypair();
    const rewardDescriptor = new web3_js_1.Keypair();
    const rewardList = new web3_js_1.Keypair();
    config.hash_list = hashList.publicKey.toBase58();
    config.reward_descriptor = rewardDescriptor.publicKey.toBase58();
    config.reward_list = rewardList.publicKey.toBase58();
    fs_lib_1.Write.config(config);
    fs_lib_1.Write.Json(Array.from(hashList.secretKey), path_1.default.resolve(fs_lib_1.Path.dataDir, "hash_list-keypair.json"));
    fs_lib_1.Write.Json(Array.from(rewardDescriptor.secretKey), path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor-keypair.json"));
    fs_lib_1.Write.Json(Array.from(rewardList.secretKey), path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list-keypair.json"));
    fs_lib_1.Cache.keys();
}
function createContainers() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = fs_lib_1.Load.config();
        const hashes = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.repDir, "hashes.json"));
        if (!hashes) {
            log_1.Log.Error("Missing hashes.json");
            throw "Missing hashes.json";
        }
        const length = hashes.length;
        fs_lib_1.Write.Json({ size: hashes.length, hashes: hashes }, path_1.default.resolve(fs_lib_1.Path.dataDir, "hash_list.json"));
        fs_lib_1.Cache.file("hash_list.json");
        fs_lib_1.Write.Json({ size: hashes.length, array: [] }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
        fs_lib_1.Write.Json({ array: [[]] }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
        fs_lib_1.Write.scriptCreate("deployContainers", "", ".ini");
        fs_lib_1.Write.scriptAppend("deployContainers", yield translator_1.Tx.createHashList(length));
        fs_lib_1.Write.scriptAppend("deployContainers", translator_1.Tx.deployHashList(length));
        fs_lib_1.Write.scriptAppend("deployContainers", yield translator_1.Tx.createRewardDescriptor(length));
        fs_lib_1.Write.scriptAppend("deployContainers", translator_1.Tx.deployRewardDescriptor());
        fs_lib_1.Write.scriptAppend("deployContainers", yield translator_1.Tx.createRewardList(config.tokens.length));
        fs_lib_1.Write.scriptAppend("deployContainers", translator_1.Tx.deployRewardList());
        (0, fs_lib_1.bakeScript)("deployContainers");
    });
}
function insertHashes() {
    const hashes = fs_lib_1.Load.hashes();
    fs_lib_1.Write.scriptCreate("insertHashes", "", ".ini");
    if (hashes.length < 15) {
        fs_lib_1.Write.scriptAppend("insertHashes", translator_1.Tx.writeHashList(0, hashes.length, hashes));
        (0, fs_lib_1.bakeScript)("insertHashes");
        return;
    }
    fs_lib_1.Write.scriptAppend("insertHashes", translator_1.Tx.writeHashList(0, 15, hashes));
    let index = 15;
    while ((index + 16) < hashes.length) {
        fs_lib_1.Write.scriptAppend("insertHashes", translator_1.Tx.writeHashList(index, index + 16, hashes));
        index += 16;
    }
    fs_lib_1.Write.scriptAppend("insertHashes", translator_1.Tx.writeHashList(index, hashes.length, hashes));
    (0, fs_lib_1.bakeScript)("insertHashes");
    return true;
}
function configure(config) {
    return __awaiter(this, void 0, void 0, function* () {
        fs_lib_1.Flush.dataDirectory();
        state_operator_1.State.create();
        const state = state_operator_1.State.get();
        state.page.instance = "init";
        state.save();
        config.royalty = env_1.default.Royalty.toBase58();
        createKeys(config);
        yield createContainers();
        insertHashes();
        state.page.instance = "configured";
        state.save();
        return { res: true, msg: "Successfully configured", state: state_operator_1.State.packActive(), logBuf: log_1.Log.pack() };
    });
}
exports.configure = configure;
function parseInstance(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = (yield env_1.default.connection.getAccountInfo(key)).data;
            const auth = new web3_js_1.PublicKey(data.slice(1, 33));
            const mint = new web3_js_1.PublicKey(data.slice(33, 65));
            const loader = new web3_js_1.PublicKey(data.slice(65, 97));
            const collection = new web3_js_1.PublicKey(data.slice(97, 129));
            const unit_time = (0, big_byte_1.fromLittleEndian)(data.slice(129, 137));
            const spec = (new bn_js_1.default(data.slice(145, 146), "le").toNumber());
            const hash_list = new web3_js_1.PublicKey(data.slice(148, 180));
            const reward_descriptor = new web3_js_1.PublicKey(data.slice(180, 212));
            const reward_list = new web3_js_1.PublicKey(data.slice(212, 244));
            let tokens = [];
            let decimals = [];
            const deposit_count = new bn_js_1.default(data.slice(281, 285), "le").toNumber();
            for (let i = 0; i < deposit_count; i++) {
                const account = new web3_js_1.PublicKey(data.slice(285 + i * 40, 317 + i * 40));
                if (account.toBase58() === env_1.default.SystemProgram.toBase58()) {
                    tokens.push(env_1.default.SystemProgram.toBase58());
                    decimals.push(9);
                }
                else {
                    const a = yield splToken.getAccount(env_1.default.connection, account, env_1.default.SystemProgram);
                    const mint = yield splToken.getMint(env_1.default.connection, a.mint, env_1.default.SystemProgram);
                    tokens.push(mint.address.toBase58());
                    decimals.push(mint.decimals);
                }
            }
            return {
                owner: auth.toBase58(),
                mint: mint.toBase58(),
                loader: loader.toBase58(),
                collection: collection.toBase58(),
                hash_list: hash_list.toBase58(),
                reward_descriptor: reward_descriptor.toBase58(),
                reward_list: reward_list.toBase58(),
                unit_time: unit_time.toString(),
                spec: spec,
                tokens: tokens,
                decimals: decimals
            };
        }
        catch (e) {
            return undefined;
        }
    });
}
function load(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = fs_lib_1.Load.config();
        fs_lib_1.Flush.dataDirectory();
        state_operator_1.State.create();
        const instance = yield parseInstance(new web3_js_1.PublicKey(address));
        if (!instance)
            return { res: false, msg: "Invalid Instance", state: state_operator_1.State.packActive(), logBuf: undefined };
        instance.instance = address;
        instance.web = config.web;
        instance.royalty = env_1.default.Royalty.toBase58();
        fs_lib_1.Write.config(instance);
        const hashList = yield (0, upload_verificator_1.parseHashList)(new web3_js_1.PublicKey(instance.hash_list));
        fs_lib_1.Write.Json(hashList, path_1.default.resolve(fs_lib_1.Path.dataDir, "hash_list.json"));
        fs_lib_1.Write.Json(yield (0, upload_verificator_1.parseRewardDescriptor)(new web3_js_1.PublicKey(instance.reward_descriptor), hashList.size), path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
        fs_lib_1.Write.Json(yield (0, upload_verificator_1.parseRewardList)(new web3_js_1.PublicKey(instance.reward_list), instance.tokens.length), path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
        const state = state_operator_1.State.get();
        state.page.instance = "deployed";
        state.save();
        return { res: true, msg: "Successfully Loaded", state: state_operator_1.State.packActive(), logBuf: undefined };
    });
}
exports.load = load;
