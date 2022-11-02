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
exports.proceed = exports.pause = exports.run = void 0;
const web3_js_1 = require("@solana/web3.js");
const accounts_1 = require("./accounts");
const log_1 = require("../log");
const env_1 = __importDefault(require("../env"));
const state_operator_1 = require("../state_operator");
const fs_lib_1 = require("../fs_lib");
const loader_1 = require("./loader");
const util_1 = require("../util");
let _isRunning = false;
function execLine(line, namespace) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const members = line.split(" ");
            const program = namespace.get(members[0]);
            let idx_array = [];
            let index = 2;
            while (members[index] !== '>') {
                idx_array.push(parseInt(members[index]));
                index++;
            }
            let idx = Buffer.from(new Uint8Array(idx_array));
            let accountMetas = [];
            let keys = [];
            let wallet = namespace.get(members[index + 1]);
            if (!program || !wallet) {
                return false;
            }
            accountMetas.push(wallet.accountMeta());
            keys = wallet.signTx(keys);
            for (let i = index + 2; i < members.length; i++) {
                if (members[i].length >= 32) {
                    const account = accounts_1.EAccount.fromString(members[i]);
                    accountMetas.push(account.accountMeta());
                    keys = account.signTx(keys);
                }
                else {
                    const account = namespace.get(members[i]);
                    if (account) {
                        accountMetas.push(account.accountMeta());
                        keys = account.signTx(keys);
                    }
                    else {
                        log_1.Log.Error("Not found in namespace: " + members[i]);
                        return false;
                    }
                }
            }
            let tx = new web3_js_1.Transaction();
            let incrIx = new web3_js_1.TransactionInstruction({
                keys: accountMetas,
                programId: program.address(),
                data: idx,
            });
            tx.add(incrIx);
            const txid = yield wallet.sendAndConfirmTransaction(tx, env_1.default.connection, keys);
            log_1.Log.Tx(txid.toString());
            return true;
        }
        catch (e) {
            log_1.Log.Error(e);
            return false;
        }
    });
}
function execScript(scriptName, startRow, state) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            state.setScriptName(scriptName);
            log_1.Log.Flow("Start scripts: " + scriptName, 4);
            let rows = fs_lib_1.Load.script(scriptName);
            const namespace = (0, loader_1.load)(rows[0].split(' '));
            if (startRow === 0)
                startRow = 1;
            for (let i = startRow; i < rows.length; i++) {
                state.setLine(i);
                log_1.Log.Flow("Exec line: " + i.toString(), 4);
                if (!_isRunning) {
                    return true;
                }
                if (!(yield execLine(rows[i], namespace))) {
                    log_1.Log.Flow("Failed line execution: " + i.toString() + " in script: " + scriptName, 2);
                    return false;
                }
            }
            state.setLine(rows.length);
            return true;
        }
        catch (e) {
            log_1.Log.Flow("Failed to run: " + scriptName, 2);
            log_1.Log.Error(e);
            return false;
        }
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        fs_lib_1.Flush.logs();
        let state = state_operator_1.State.get();
        state.setType("EVM");
        state.setScriptName("CrankUp");
        state.setLine(0);
        state.setLeft(0);
        state.setRunning();
        state.setVerified(false);
        _isRunning = true;
        const exec = () => __awaiter(this, void 0, void 0, function* () {
            const scripts = fs_lib_1.Load.plot();
            for (let i = 0; i < scripts.length; i++) {
                state.setLeft(i);
                if (!_isRunning) {
                    log_1.Log.Flow("Interrupted", 1);
                    state.setInterrupted();
                    return;
                }
                if (!(yield execScript(scripts[i], 1, state))) {
                    _isRunning = false;
                    state.setFailed();
                    return;
                }
            }
            _isRunning = false;
            state.setCompleted();
            log_1.Log.Flow("Completed", 1);
        });
        (0, util_1.execAsync)(exec);
        return { "res": true, "msg": undefined };
    });
}
exports.run = run;
function pause() {
    return __awaiter(this, void 0, void 0, function* () {
        _isRunning = false;
        return { "res": true, "msg": undefined };
    });
}
exports.pause = pause;
function proceed() {
    return __awaiter(this, void 0, void 0, function* () {
        let state = state_operator_1.State.get();
        state.setType("EVM");
        state.setRunning();
        _isRunning = true;
        const exec = () => __awaiter(this, void 0, void 0, function* () {
            const scripts = fs_lib_1.Load.plot();
            const lastScript = state.script;
            let index = 0;
            while ((scripts[index] != lastScript) && lastScript !== 'CrankUp') {
                index++;
                if (index >= scripts.length) {
                    log_1.Log.Flow("Failed to find from where to continue", 2);
                    _isRunning = false;
                    state.setFailed();
                    return;
                }
            }
            log_1.Log.Flow("Proceed from: " + scripts[index] + ": " + state.row, 1);
            if (!(yield execScript(scripts[index], state.row, state))) {
                _isRunning = false;
                state.setFailed();
                return;
            }
            for (let i = index + 1; i < scripts.length; i++) {
                state.setLeft(i);
                if (!_isRunning) {
                    log_1.Log.Flow("Interrupted", 1);
                    state.setInterrupted();
                    return;
                }
                if (!(yield execScript(scripts[i], 1, state))) {
                    _isRunning = false;
                    state.setFailed();
                    return;
                }
            }
            _isRunning = false;
            state.setCompleted();
            log_1.Log.Flow("Completed", 1);
        });
        (0, util_1.execAsync)(exec);
        return { "res": true, "msg": undefined };
    });
}
exports.proceed = proceed;
