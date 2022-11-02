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
exports.fetchTraits = void 0;
const web3_js_1 = require("@solana/web3.js");
const env_1 = __importDefault(require("../env"));
const log_1 = require("../log");
const fs_lib_1 = require("../fs_lib");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const state_operator_1 = require("../state_operator");
const util_1 = require("../util");
function fetchMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield axios_1.default.get(url)
            .then(function (response) {
            return response.data;
        })
            .catch(function (error) {
        });
    });
}
function findMissedMetadata(hashes) {
    const files = fs_lib_1.Search.files(path_1.default.resolve(fs_lib_1.Path.dataDir, "Traits"));
    const m = new Set(files);
    let missed = [];
    hashes.forEach((hash) => {
        if (!m.has(hash + ".json")) {
            missed.push(hash);
        }
    });
    return missed;
}
function fetchMetadataFromHashes(hashes, collection, state) {
    return __awaiter(this, void 0, void 0, function* () {
        state.setMissed(0);
        state.setLeft(hashes.length);
        for (let i = 0; i < hashes.length; i++) {
            const hash = hashes[i];
            const meta = yield (0, util_1.getMetadataAddress)(new web3_js_1.PublicKey(hash));
            const metadata = yield mpl_token_metadata_1.Metadata.fromAccountAddress(env_1.default.connection, meta);
            if (!metadata) {
                state.setMissed(state.missed + 1);
                continue;
            }
            const o = yield fetchMetadata(metadata.data.uri);
            if (!o || !o.hasOwnProperty('attributes')) {
                state.setMissed(state.missed + 1);
                continue;
            }
            fs_lib_1.Write.Json({ "traits": o.attributes }, path_1.default.resolve(fs_lib_1.Path.dataDir, "Traits", hash + ".json"));
            state.setLeft(state.left - 1);
        }
    });
}
function fetchMetadataCycled(hashes, cycles, state) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = fs_lib_1.Load.config();
        const collection = config.collection;
        try {
            let index = 0;
            while (hashes.length > 0 && index < cycles) {
                yield fetchMetadataFromHashes(hashes, collection, state);
                hashes = findMissedMetadata(hashes);
                index++;
            }
            if (hashes.length > 0) {
                log_1.Log.Flow("Missed: " + hashes.length.toString(), 2);
                return false;
            }
            return true;
        }
        catch (e) {
            log_1.Log.Error(e);
            return false;
        }
    });
}
function gatherTraits() {
    const files = fs_lib_1.Search.files(path_1.default.resolve(fs_lib_1.Path.dataDir, "Traits"));
    let traits = new Map();
    files.forEach((file) => {
        const o = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "Traits", file));
        o.traits.forEach((t) => {
            if (traits.has(t.trait_type)) {
                let trait = traits.get(t.trait_type);
                trait.add(t.value);
            }
            else {
                let s = new Set();
                s.add(t.value);
                traits.set(t.trait_type, s);
            }
        });
    });
    let data = { "traits": [] };
    traits.forEach((value, key) => {
        data.traits.push({ "values": Array.from(value), "trait_type": key });
    });
    fs_lib_1.Write.Json(data, path_1.default.resolve(fs_lib_1.Path.dataDir, "traits.json"));
}
function fetchTraits() {
    return __awaiter(this, void 0, void 0, function* () {
        let state = state_operator_1.State.get();
        state.setType("Fetch");
        let hashes = fs_lib_1.Load.hashes();
        hashes = findMissedMetadata(hashes);
        state.setLeft(hashes.length);
        state.setMissed(0);
        state.setRunning();
        const exec = () => __awaiter(this, void 0, void 0, function* () {
            if (!(yield fetchMetadataCycled(hashes, 3, state))) {
                state.setFailed();
                return;
            }
            gatherTraits();
            state.setCompleted();
        });
        (0, util_1.execAsync)(exec);
        return { "res": true, "msg": undefined };
    });
}
exports.fetchTraits = fetchTraits;
