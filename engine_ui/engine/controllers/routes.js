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
const Router = require('express');
const router = new Router();
const state_operator_1 = require("../state_operator");
const log_1 = require("../log");
const trait_fetcher_1 = require("./trait_fetcher");
const runner_1 = require("../interpreter/runner");
const fs_lib_1 = require("../fs_lib");
const path_1 = __importDefault(require("path"));
var dataDir = fs_lib_1.Path.dataDir;
const descriptor_writer_1 = require("./descriptor_writer");
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const instance_operator_1 = require("./instance_operator");
const upload_verificator_1 = require("./upload_verificator");
const web3_js_2 = require("@solana/web3.js");
const env_1 = __importDefault(require("../env"));
const accounts_1 = require("../interpreter/accounts");
function wE(func) {
    return ((req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            return res.json(yield func(req, res));
        }
        catch (e) {
            log_1.Log.Error(e);
            log_1.Log.Flow("Critical Error", 2);
            return res.json({
                res: false,
                msg: "Critical Error",
                state: undefined,
                logBuf: log_1.Log.pack()
            });
        }
    }));
}
function wA(func) {
    return ((req, res) => __awaiter(this, void 0, void 0, function* () {
        const response = (yield func());
        return {
            res: response.res,
            msg: response.msg,
            state: state_operator_1.State.packActive(),
            logBuf: log_1.Log.pack()
        };
    }));
}
function getConfig(req, res) {
    try {
        const config = fs_lib_1.Load.config();
        return res.json({ config: config });
    }
    catch (e) {
        return res.json({ config: undefined });
    }
}
function setConfig(req, res) {
    const config = req.body;
    if (!config) {
        throw "Wrong config format";
    }
    fs_lib_1.Write.Json(config, path_1.default.resolve(fs_lib_1.Path.dataDir, "config.json"));
    return { res: true, msg: undefined, state: undefined, logBuf: undefined };
}
function configureInstance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = req.body;
        if (!config) {
            throw "Wrong config format";
        }
        return yield (0, instance_operator_1.configure)(config);
    });
}
function loadInstance(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const address = req.body;
        if (!address) {
            throw "Wrong config format";
        }
        return yield (0, instance_operator_1.load)(address.address);
    });
}
function setPageState(req, res) {
    const { type, state } = req.body;
    if (!type || !state) {
        throw "Wrong page state format";
    }
    state_operator_1.State.setPageState(state, type);
    return { res: true, msg: undefined, state: undefined, logBuf: undefined };
}
function getLoader(req, res) {
    const loader = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "loader-keypair.json"));
    const key = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(loader)).publicKey;
    return { res: true, msg: undefined, state: undefined, logBuf: undefined, loader: key.toBase58() };
}
function loaderWithdraw(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const config = fs_lib_1.Load.config();
        const owner = new web3_js_2.PublicKey(config.owner);
        const loader = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "loader-keypair.json"));
        const loader_key = web3_js_1.Keypair.fromSecretKey(Uint8Array.from(loader));
        const tx = new web3_js_1.Transaction().add(new web3_js_1.TransactionInstruction({
            programId: env_1.default.StakeProgram,
            keys: [{
                    pubkey: loader_key.publicKey,
                    isSigner: true,
                    isWritable: true,
                },
                {
                    pubkey: owner,
                    isSigner: false,
                    isWritable: true,
                },
                {
                    pubkey: env_1.default.SystemProgram,
                    isSigner: false,
                    isWritable: false,
                }],
            data: Buffer.from(Uint8Array.from([24]))
        }));
        const wallet = new accounts_1.EWallet(loader_key);
        const txid = yield wallet.sendAndConfirmTransaction(tx, env_1.default.connection._, [loader_key]);
        log_1.Log.Tx(txid.toString());
        return { res: true, msg: "Successfully withdrew funds from Loader" };
    });
}
function loadStates(req, res) {
    const s = state_operator_1.State.get();
    const m = s.map;
    log_1.Log.load();
    return { res: true, msg: undefined, state: state_operator_1.State.packActive(), logBuf: log_1.Log.pack(),
        states: { "EVM": m.get("EVM"), "Fetch": m.get("Fetch"), "Check": m.get("Check") },
        pages: { instance: s.page.instance, rewards: s.page.rewards } };
}
function refreshStates(req, res) {
    return { res: true, msg: undefined, state: state_operator_1.State.packActive(), logBuf: log_1.Log.pack() };
}
function logBack(req, res) {
    const line = req.body;
    if (line) {
        fs_1.default.appendFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "flow.txt"), JSON.stringify(line) + "\n");
    }
    return { res: true, msg: undefined, state: undefined, logBuf: undefined };
}
function getHashesCount(req, res) {
    const hashes = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.repDir, "hashes.json"));
    if (!hashes)
        return { res: false, msg: "Cannot find hashes.json", state: undefined, logBuf: undefined };
    return { res: true, msg: undefined, state: undefined, logBuf: undefined, count: hashes.length };
}
function getTraits(req, res) {
    return { res: true, msg: undefined, state: undefined, logBuf: undefined, traits: fs_lib_1.Load.traits() };
}
function setValues(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const values = req.body;
        if (!values)
            throw "Vals are empty";
        fs_lib_1.Cache.values();
        fs_lib_1.Write.Json(values, path_1.default.resolve(dataDir, "values.json"));
        return yield (wA(descriptor_writer_1.writeDescriptors))();
    });
}
function setBase(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const values = req.body;
        if (!values)
            throw "Vals are empty";
        fs_lib_1.Cache.values();
        fs_lib_1.Write.Json(values, path_1.default.resolve(dataDir, "values.json"));
        return yield (wA(descriptor_writer_1.writeBaseValue))();
    });
}
function getValues(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        return { res: true, msg: undefined, state: undefined, logBuf: undefined,
            values: fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "values.json")) };
    });
}
function getScripts(req, res) {
    return { res: true, msg: undefined, state: undefined, logBuf: undefined, plot: fs_lib_1.Load.plot() };
}
function getTokens(req, res) {
    const tokens = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "tokens.json"));
    if (!tokens) {
        return { res: false, msg: "Cannot find tokens.json" };
    }
    return { res: true, msg: undefined, list: tokens.list };
}
function setTokens(req, res) {
    const tokens = req.body;
    if (!tokens) {
        return { res: false, msg: "Wrong tokens.json format posted", state: undefined, logBuf: undefined };
    }
    fs_lib_1.Write.Json(tokens, path_1.default.resolve(fs_lib_1.Path.dataDir, "tokens.json"));
    return { res: true, msg: undefined, state: undefined, logBuf: undefined };
}
router.post('/get_config', getConfig);
router.post('/set_config', wE(setConfig));
router.post('/set_page', wE(setPageState));
router.post('/configure_instance', wE(configureInstance));
router.post('/load_instance', wE(loadInstance));
router.post('/loader_withdraw', wE(loaderWithdraw));
router.post('/get_loader', wE(getLoader));
router.post('/load_states', wE(loadStates));
router.post('/refresh_states', wE(refreshStates));
router.post('/log_back', wE(logBack));
router.post("/get_hashes_count", wE(getHashesCount));
router.post('/fetch_traits', wE(wA(trait_fetcher_1.fetchTraits)));
router.post('/get_traits', wE(getTraits));
router.post('/set_base', wE(setBase));
router.post('/set_values', wE(setValues));
router.post('/get_values', wE(getValues));
router.post('/verify_upload', wE(wA(upload_verificator_1.verify)));
router.post('/run_engine', wE(wA(runner_1.run)));
router.post('/pause_engine', wE(wA(runner_1.pause)));
router.post('/continue_engine', wE(wA(runner_1.proceed)));
router.post('/get_scripts', wE(getScripts));
router.post('/set_tokens', wE(setTokens));
router.post('/get_tokens', wE(getTokens));
exports.default = router;
