"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBaseValue = exports.configureBaseDescriptors = exports.writeDescriptors = void 0;
const fs_lib_1 = require("../fs_lib");
const log_1 = require("../log");
const path_1 = __importDefault(require("path"));
const translator_1 = require("../interpreter/translator");
const web3_js_1 = require("@solana/web3.js");
const big_integer_1 = __importDefault(require("big-integer"));
const big_byte_1 = require("../big-byte");
const state_operator_1 = require("../state_operator");
function calcValue() {
    const values = fs_lib_1.Load.values();
    let base_array = [];
    values.base_value.forEach((v) => {
        base_array.push((0, big_integer_1.default)(v));
    });
    const hashes = fs_lib_1.Load.hashes();
    hashes.forEach((hash) => {
        const hashObject = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "Traits", hash + ".json"));
        if (!hashObject) {
            log_1.Log.Flow("Cannot find trait for: " + hash, 2);
            return false;
        }
        let vals = Array.from(base_array);
        hashObject.traits.forEach((o) => {
            const trait_type = o.trait_type;
            const type = o.value;
            if (values.used_traits[trait_type]) {
                const v = (0, big_integer_1.default)(values.used_traits[trait_type][type]);
                for (let i = 0; i < base_array.length; i++) {
                    vals[i] = (vals[i]).add(v[i]);
                }
            }
        });
        fs_lib_1.Write.Json(Array.from(vals), path_1.default.resolve(fs_lib_1.Path.dataDir, "Vals", hash + ".json"));
    });
    return true;
}
function configureDescriptors() {
    const config = fs_lib_1.Load.config();
    const depositCount = config.tokens.length;
    const hashes = fs_lib_1.Load.hashes();
    const rewards = new Map();
    let rewardIndex = 0;
    let rewardDescriptorArray = Array(hashes.length).fill(0);
    for (let i = 0; i < hashes.length; i++) {
        const hash = hashes[i];
        const r = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "Vals", hash + ".json"));
        if (!r)
            throw ("Failed to load vals for: " + hash);
        if (rewards.has(JSON.stringify(r))) {
            rewardDescriptorArray[i] = rewards.get(JSON.stringify(r));
        }
        else {
            rewards.set(JSON.stringify(r), rewardIndex);
            rewardDescriptorArray[i] = rewardIndex;
            rewardIndex++;
            if (rewardIndex >= 257) {
                log_1.Log.Flow("Only 256 reward variants allowed", 2);
                return false;
            }
        }
    }
    fs_lib_1.Write.Json({
        size: hashes.length,
        array: rewardDescriptorArray
    }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
    let rewardArray = Array(256).fill(Array(depositCount).fill("0"));
    rewards.forEach((value, key) => {
        rewardArray[value] = JSON.parse(key);
    });
    fs_lib_1.Write.Json({
        array: rewardArray
    }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
    return true;
}
function fillRewardDescriptor() {
    const rewardDescriptor = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
    const byteArray = rewardDescriptor.array;
    let keyArray = [];
    let index = 0;
    while ((index + 32) <= byteArray.length) {
        keyArray.push(new web3_js_1.PublicKey(byteArray.slice(index, index + 32)));
        index += 32;
    }
    if (index < byteArray.length) {
        let a = byteArray.slice(index, byteArray.length);
        a = a.concat(Array(32 - a.length).fill(0));
        keyArray.push(new web3_js_1.PublicKey(a));
    }
    fs_lib_1.Write.scriptCreate("writeRewardDescriptor", "", ".ini");
    if (keyArray.length > 15) {
        fs_lib_1.Write.scriptAppend("writeRewardDescriptor", translator_1.Tx.writeRewardDescriptor(0, 15, keyArray));
    }
    else {
        fs_lib_1.Write.scriptAppend("writeRewardDescriptor", translator_1.Tx.writeRewardDescriptor(0, keyArray.length, keyArray));
        (0, fs_lib_1.bakeScript)("writeRewardDescriptor");
        return;
    }
    index = 15;
    while (index + 16 < keyArray.length) {
        fs_lib_1.Write.scriptAppend("writeRewardDescriptor", translator_1.Tx.writeRewardDescriptor(index, index + 16, keyArray));
        index += 16;
    }
    if (index < keyArray.length) {
        fs_lib_1.Write.scriptAppend("writeRewardDescriptor", translator_1.Tx.writeRewardDescriptor(index, keyArray.length, keyArray));
    }
    (0, fs_lib_1.bakeScript)("writeRewardDescriptor");
}
function fillRewardList() {
    const rewardList = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
    const rewards = rewardList.array;
    let keyArray = [];
    let bufferArray = [];
    for (let i = 0; i < rewards.length; i++) {
        rewards[i].forEach((r) => {
            bufferArray = bufferArray.concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(r), 8)));
            if (bufferArray.length == 32) {
                keyArray.push(new web3_js_1.PublicKey(bufferArray));
                bufferArray = [];
            }
        });
    }
    fs_lib_1.Write.scriptCreate("writeRewardList", "", ".ini");
    if (keyArray.length > 15) {
        fs_lib_1.Write.scriptAppend("writeRewardList", translator_1.Tx.writeRewardList(0, 15, keyArray));
    }
    else {
        fs_lib_1.Write.scriptAppend("writeRewardList", translator_1.Tx.writeRewardList(0, keyArray.length, keyArray));
        (0, fs_lib_1.bakeScript)("writeRewardList");
        return;
    }
    let index = 15;
    while ((index + 16) < keyArray.length) {
        fs_lib_1.Write.scriptAppend("writeRewardList", translator_1.Tx.writeRewardList(index, index + 16, keyArray));
        index += 16;
    }
    fs_lib_1.Write.scriptAppend("writeRewardList", translator_1.Tx.writeRewardList(index, keyArray.length, keyArray));
    (0, fs_lib_1.bakeScript)("writeRewardList");
}
function writeDescriptors() {
    fs_lib_1.Flush.writeScripts();
    if (!calcValue()) {
        return { "res": false, "msg": "Failed to calculate rewards" };
    }
    if (!configureDescriptors()) {
        return { "res": false, "msg": "Failed configure descriptors" };
    }
    fillRewardDescriptor();
    fillRewardList();
    state_operator_1.State.get().map.get("EVM").state = "none";
    state_operator_1.State.get().save();
    return { "res": true, "msg": "Successfully wrote scripts" };
}
exports.writeDescriptors = writeDescriptors;
function configureBaseDescriptors() {
    const values = fs_lib_1.Load.values();
    const config = fs_lib_1.Load.config();
    const depositCount = config.tokens.length;
    const hashes = fs_lib_1.Load.hashes();
    fs_lib_1.Write.Json({
        size: hashes.length,
        array: Array(hashes.length).fill(0)
    }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_descriptor.json"));
    let rewardArray = Array(256).fill(Array(depositCount).fill("0"));
    rewardArray[0] = values.base_value;
    fs_lib_1.Write.Json({
        array: rewardArray
    }, path_1.default.resolve(fs_lib_1.Path.dataDir, "reward_list.json"));
}
exports.configureBaseDescriptors = configureBaseDescriptors;
function flushScripts() {
    const state = state_operator_1.State.get();
    state.setType("EVM");
    let script = state.script;
    if (script === 'insertHashes' || script === 'deployContainers' || state.state === 'none') {
        fs_lib_1.Flush.writeScripts();
    }
    else {
        fs_lib_1.Flush.writeScripts();
        fs_lib_1.Flush.initScripts();
        state.setScriptName("");
        state.setLine(0);
        state.state = "none";
    }
    state.save();
}
function writeBaseValue() {
    flushScripts();
    configureBaseDescriptors();
    fillRewardDescriptor();
    fillRewardList();
    state_operator_1.State.get().map.get("EVM").state = "none";
    state_operator_1.State.get().save();
    return { "res": true, "msg": "Successfully wrote scripts" };
}
exports.writeBaseValue = writeBaseValue;
