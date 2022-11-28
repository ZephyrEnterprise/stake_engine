"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDataDir = exports.bakeScript = exports.Path = exports.Cache = exports.Flush = exports.Load = exports.Write = exports.Search = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const web3_js_1 = require("@solana/web3.js");
const log_1 = require("./log");
const util_1 = require("./util");
const state_operator_1 = require("./state_operator");
const env_1 = __importDefault(require("./env"));
var Search;
(function (Search) {
    function files(filepath) {
        return fs_1.default.readdirSync(filepath).filter(function (file) {
            return fs_1.default.statSync(filepath + '/' + file).isFile();
        });
    }
    Search.files = files;
    function dirs(filepath) {
        return fs_1.default.readdirSync(filepath).filter(function (file) {
            return fs_1.default.statSync(filepath + '/' + file).isDirectory();
        });
    }
    Search.dirs = dirs;
})(Search = exports.Search || (exports.Search = {}));
var Write;
(function (Write) {
    function Json(o, filepath) {
        const data = JSON.stringify(o);
        fs_1.default.writeFileSync(filepath, data);
    }
    Write.Json = Json;
    function scriptCreate(name, data, format) {
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "..", "data", "scripts", name + format), data);
    }
    Write.scriptCreate = scriptCreate;
    function scriptAppend(name, row) {
        fs_1.default.appendFileSync(path_1.default.resolve(__dirname, "..", "data", "scripts", name + ".ini"), "\n" + row);
    }
    Write.scriptAppend = scriptAppend;
    function config(c) {
        Write.Json(c, path_1.default.resolve(Path.dataDir, "config.json"));
    }
    Write.config = config;
})(Write = exports.Write || (exports.Write = {}));
var Load;
(function (Load) {
    function Json(filepath) {
        const data = fs_1.default.readFileSync(filepath);
        return JSON.parse(data.toString());
    }
    Load.Json = Json;
    function keypair(name) {
        let filepath = path_1.default.resolve(__dirname, "..", "data", name + ".json");
        const array = Json(filepath);
        try {
            return web3_js_1.Keypair.fromSecretKey(new Uint8Array(array));
        }
        catch (e) {
            log_1.Log.Flow("Cannot load: " + name, 2);
            throw e;
        }
    }
    Load.keypair = keypair;
    function script(name) {
        let filepath = path_1.default.resolve(Path.dataDir, "scripts", name + ".eng");
        return fs_1.default.readFileSync(filepath).toString().split("\n");
    }
    Load.script = script;
    function plot() {
        let filepath = path_1.default.resolve(Path.dataDir, "scripts", "plot.txt");
        const array = fs_1.default.readFileSync(filepath).toString().split("\n");
        let res = [];
        array.forEach((s) => {
            if (s !== "" && s !== "\n") {
                res.push(s);
            }
        });
        return res;
    }
    Load.plot = plot;
    function hashes() {
        const hashesList = Load.Json(path_1.default.resolve(Path.dataDir, "hash_list.json"));
        if (!hashesList) {
            log_1.Log.Flow("Cannot find hash_list.json", 2);
            throw "Cannot find hash_list.json";
        }
        return hashesList.hashes;
    }
    Load.hashes = hashes;
    function values() {
        const values = Load.Json(path_1.default.resolve(Path.dataDir, "values.json"));
        if (!values) {
            log_1.Log.Flow("Cannot find values.json", 2);
            throw "Cannot find values.json";
        }
        return values;
    }
    Load.values = values;
    function traits() {
        const traits = Load.Json(path_1.default.resolve(Path.dataDir, "traits.json"));
        if (!traits) {
            log_1.Log.Flow("Cannot traits.json", 2);
            throw "Cannot find traits.json";
        }
        return traits;
    }
    Load.traits = traits;
    function config() {
        const config = Load.Json(path_1.default.resolve(Path.dataDir, "config.json"));
        if (!config) {
            log_1.Log.Flow("Cannot find config.json", 2);
            throw "Cannot find config.json";
        }
        return config;
    }
    Load.config = config;
})(Load = exports.Load || (exports.Load = {}));
var Flush;
(function (Flush) {
    function file(name) {
        if (fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, name))) {
            fs_1.default.unlinkSync(path_1.default.resolve(Path.dataDir, name));
        }
    }
    Flush.file = file;
    function directory(dirName) {
        if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, dirName)))
            return;
        fs_1.default.rmdirSync(path_1.default.resolve(Path.dataDir, dirName), { recursive: true, force: true });
    }
    const ignoredFiles = new Set(["config.json", "loader-keypair.json", "states.json", "tokens.json"]);
    function dataDirectory() {
        Cache.directory("logs");
        Cache.directory("scripts");
        Cache.directory(undefined);
        const dirs = Search.dirs(Path.dataDir);
        const files = Search.files(Path.dataDir);
        dirs.forEach((dir) => {
            directory(dir);
        });
        files.forEach((file) => {
            if (ignoredFiles.has(file))
                return;
            fs_1.default.unlinkSync(path_1.default.resolve(Path.dataDir, file));
        });
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "Traits"));
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "Vals"));
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "logs"));
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "scripts"));
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"), "");
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "err.txt"), "");
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "tx.txt"), "");
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "flow.txt"), "");
    }
    Flush.dataDirectory = dataDirectory;
    function logs() {
        Cache.directory("logs");
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "..", "data", "logs", "err.txt"), "");
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "..", "data", "logs", "tx.txt"), "");
        fs_1.default.writeFileSync(path_1.default.resolve(__dirname, "..", "data", "logs", "flow.txt"), "");
    }
    Flush.logs = logs;
    const initScriptsNames = new Set(["deployContainers", "insertHashes"]);
    function initScripts() {
        const plot = Load.plot();
        let newPlot = "";
        Cache.directory("scripts");
        plot.forEach((script) => {
            if (initScriptsNames.has(script)) {
                fs_1.default.unlinkSync(path_1.default.resolve(Path.dataDir, "scripts", script + ".eng"));
            }
            else {
                newPlot += script + "\n";
            }
        });
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"), newPlot);
    }
    Flush.initScripts = initScripts;
    function writeScripts() {
        const plot = Load.plot();
        let newPlot = "";
        Cache.directory("scripts");
        plot.forEach((script) => {
            if (!initScriptsNames.has(script)) {
                fs_1.default.unlinkSync(path_1.default.resolve(Path.dataDir, "scripts", script + ".eng"));
            }
            else {
                newPlot += script + "\n";
            }
        });
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"), newPlot);
    }
    Flush.writeScripts = writeScripts;
})(Flush = exports.Flush || (exports.Flush = {}));
var Cache;
(function (Cache) {
    const sessionDate = (0, util_1.getDateFormated)();
    let session = new web3_js_1.Keypair().publicKey.toBase58();
    function directory(dirName) {
        if (dirName) {
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, dirName)))
                return;
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate));
            }
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
            }
            const files = Search.files(path_1.default.resolve(Path.dataDir, dirName));
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, dirName))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, dirName));
            }
            else {
                session = new web3_js_1.Keypair().publicKey.toBase58();
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, dirName));
            }
            files.forEach((file) => {
                fs_1.default.writeFileSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, dirName, file), fs_1.default.readFileSync(path_1.default.resolve(Path.dataDir, dirName, file)));
            });
        }
        else {
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate));
            }
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
            }
            const files = Search.files(Path.dataDir);
            if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, "data"))) {
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, "data"));
            }
            else {
                session = new web3_js_1.Keypair().publicKey.toBase58();
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
                fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, "data"));
            }
            files.forEach((file) => {
                fs_1.default.writeFileSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, "data", file), fs_1.default.readFileSync(path_1.default.resolve(Path.dataDir, file)));
            });
        }
    }
    Cache.directory = directory;
    function file(name) {
        if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, name)))
            return;
        if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate))) {
            fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate));
        }
        if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session))) {
            fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
        }
        if (!fs_1.default.existsSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, name))) {
            fs_1.default.writeFileSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, name), fs_1.default.readFileSync(path_1.default.resolve(Path.dataDir, name)));
        }
        else {
            session = new web3_js_1.Keypair().publicKey.toBase58();
            fs_1.default.mkdirSync(path_1.default.resolve(Path.cacheDir, sessionDate, session));
            fs_1.default.writeFileSync(path_1.default.resolve(Path.cacheDir, sessionDate, session, name), fs_1.default.readFileSync(path_1.default.resolve(Path.dataDir, name)));
        }
    }
    Cache.file = file;
    function keys() {
        Cache.file("hash_list-keypair.json");
        Cache.file("reward_descriptor-keypair.json");
        Cache.file("reward_list-keypair.json");
    }
    Cache.keys = keys;
    function values() {
        Cache.file("values.json");
        Cache.file("reward_descriptor.json");
        Cache.file("reward_list.json");
    }
    Cache.values = values;
})(Cache = exports.Cache || (exports.Cache = {}));
var Path;
(function (Path) {
    Path.dataDir = path_1.default.resolve(__dirname, "..", "data");
    Path.repDir = path_1.default.resolve(__dirname, "..");
    Path.cacheDir = path_1.default.resolve(__dirname, "..", ".cache");
})(Path = exports.Path || (exports.Path = {}));
function bakeScript(name) {
    let script = fs_1.default.readFileSync(path_1.default.resolve(Path.dataDir, "scripts", name + ".ini")).toString();
    const rows = script.split("\n").slice(1);
    const namespace = new Set();
    rows.forEach((row) => {
        const members = row.split(" ");
        namespace.add(members[0]);
        let index = 0;
        while (members[index] != '>') {
            index++;
        }
        index++;
        while (index < members.length) {
            if (members[index].length < 32) {
                namespace.add(members[index]);
            }
            index++;
        }
    });
    let required = "";
    namespace.forEach((name) => {
        required += name.toString() + " ";
    });
    script = required + script;
    fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "scripts", name + ".eng"), script);
    fs_1.default.unlinkSync(path_1.default.resolve(Path.dataDir, "scripts", name + ".ini"));
    fs_1.default.appendFileSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"), name + "\n");
}
exports.bakeScript = bakeScript;
function checkDataDir() {
    if (!fs_1.default.existsSync(Path.dataDir)) {
        fs_1.default.mkdirSync(Path.dataDir);
    }
    if (!fs_1.default.existsSync(Path.cacheDir)) {
        fs_1.default.mkdirSync(Path.cacheDir);
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "logs"))) {
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "logs"));
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "logs", "tx.txt"))) {
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "tx.txt"), "");
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "logs", "err.txt"))) {
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "err.txt"), "");
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "logs", "flow.txt"))) {
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "logs", "flow.txt"), "");
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "scripts"))) {
        fs_1.default.mkdirSync(path_1.default.resolve(Path.dataDir, "scripts"));
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"))) {
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "scripts", "plot.txt"), "");
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "tokens.json"))) {
        fs_1.default.writeFileSync(path_1.default.resolve(Path.dataDir, "tokens.json"), JSON.stringify({ list: [] }));
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "config.json"))) {
        const config = {
            "instance": "",
            "mint": "",
            "owner": "",
            "collection": "",
            "hash_list": "",
            "reward_descriptor": "",
            "reward_list": "",
            "tokens": [],
            "decimals": [],
            "unit_time": "",
            "spec": 0,
            "web": "devnet",
            "royalty": env_1.default.Royalty.toBase58(),
        };
        Write.config(config);
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "loader-keypair.json"))) {
        const loader = new web3_js_1.Keypair();
        Write.Json(Array.from(loader.secretKey), path_1.default.resolve(Path.dataDir, "loader-keypair.json"));
    }
    if (!fs_1.default.existsSync(path_1.default.resolve(Path.dataDir, "states.json"))) {
        state_operator_1.State.create();
    }
    return true;
}
exports.checkDataDir = checkDataDir;
