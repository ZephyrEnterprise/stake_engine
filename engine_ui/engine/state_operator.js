"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const fs_lib_1 = require("./fs_lib");
const path_1 = __importDefault(require("path"));
const log_1 = require("./log");
let _state = null;
const stateTypes = ["EVM", "Fetch", "Check"];
class State {
    constructor() {
        const o = fs_lib_1.Load.Json(path_1.default.resolve(fs_lib_1.Path.dataDir, "states.json"));
        this.map = new Map();
        stateTypes.forEach((type) => {
            if (o.states[type].state === 'running')
                o.states[type].state = "interrupted";
            this.map.set(type, o.states[type]);
        });
        this.type = o.base.type;
        this.isRunning = false;
        this.isVerified = o.base.isVerified;
        this.page = o.page;
        const activeState = o.states[this.type];
        if (!activeState) {
            log_1.Log.Flow("Cannot find states.json", 2);
            throw "Cannot find states.json";
        }
        this.script = activeState.script;
        this.left = activeState.left;
        this.row = activeState.row;
        this.missed = activeState.missed;
        this.state = activeState.state;
    }
    static create() {
        let states = {};
        stateTypes.forEach((value) => {
            states[value] = {
                left: 0,
                missed: 0,
                row: 0,
                script: "",
                state: "none"
            };
        });
        const base = {
            type: stateTypes[0],
            isRunning: false,
            isVerified: false,
        };
        fs_lib_1.Write.Json({ states: states, base: base, page: { instance: "none", rewards: "none" } }, path_1.default.resolve(fs_lib_1.Path.dataDir, "states.json"));
    }
    save() {
        this.map.set(this.type, this.packActive());
        let states = {};
        this.map.forEach((value, key) => {
            states[key] = value;
        });
        const o = {
            states: states,
            base: this.packBase(),
            page: this.page
        };
        fs_lib_1.Write.Json(o, path_1.default.resolve(fs_lib_1.Path.dataDir, "states.json"));
    }
    packBase() {
        return {
            isVerified: this.isVerified,
            isRunning: this.isRunning,
            type: this.type,
        };
    }
    packActive() {
        return {
            script: this.script,
            left: this.left,
            missed: this.missed,
            row: this.row,
            state: this.state
        };
    }
    unpackToActive(activeState) {
        this.script = activeState.script;
        this.left = activeState.left;
        this.row = activeState.row;
        this.missed = activeState.missed;
        this.state = activeState.state;
    }
    static get() {
        if (!_state) {
            _state = new State();
        }
        return _state;
    }
    setRunning() {
        this.state = "running";
        this.isRunning = true;
        this.save();
    }
    setInterrupted() {
        this.state = "interrupted";
        this.isRunning = false;
        this.save();
    }
    setCompleted() {
        this.state = "completed";
        this.isRunning = false;
        this.save();
    }
    setFailed() {
        this.state = "failed";
        this.isRunning = false;
        this.save();
    }
    setScriptName(name) {
        this.script = name;
        this.save();
    }
    setLine(index) {
        this.row = index;
        this.save();
    }
    setType(type) {
        const lastState = this.packActive();
        this.map.set(this.type, lastState);
        this.unpackToActive(this.map.get(type));
        this.type = type;
        this.save();
    }
    setVerified(is) {
        this.isVerified = is;
        this.save();
    }
    setLeft(num) {
        this.left = num;
        this.save();
    }
    setMissed(num) {
        this.missed = num;
        this.save();
    }
    static setPageState(state, type) {
        const s = State.get();
        s.page[type] = state;
        s.save();
    }
    static packActive() {
        const s = State.get();
        return [s.packActive(), s.packBase()];
    }
}
exports.State = State;
