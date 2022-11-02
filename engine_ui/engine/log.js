"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fs_lib_1 = require("./fs_lib");
var Log;
(function (Log) {
    let flowBuffer = [];
    function flush() {
        fs_lib_1.Flush.logs();
    }
    Log.flush = flush;
    function load() {
        const rows = fs_1.default.readFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "flow.txt")).toString().split("\n");
        flowBuffer = [];
        rows.forEach((row) => {
            if (row !== "\n" && row !== "") {
                flowBuffer.push(JSON.parse(row));
            }
        });
        return flowBuffer;
    }
    Log.load = load;
    function pack() {
        const buf = flowBuffer;
        flowBuffer = [];
        return buf;
    }
    Log.pack = pack;
    function back(lines) {
        let s = "";
        for (let i = 0; i < lines.length; i++) {
            s += JSON.stringify(lines[i]) + "\n";
            fs_1.default.appendFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "flow.txt"), s);
        }
    }
    Log.back = back;
    function Error(text) {
        fs_1.default.appendFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "err.txt"), text + "\n");
    }
    Log.Error = Error;
    function Tx(text) {
        fs_1.default.appendFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "tx.txt"), text + "\n");
        Log.Flow(text, 0);
    }
    Log.Tx = Tx;
    function Flow(text, type) {
        fs_1.default.appendFileSync(path_1.default.resolve(fs_lib_1.Path.dataDir, "logs", "flow.txt"), JSON.stringify({ type, text }) + "\n");
        flowBuffer.push({ type, text });
    }
    Log.Flow = Flow;
})(Log = exports.Log || (exports.Log = {}));
