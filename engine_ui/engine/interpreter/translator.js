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
exports.Tx = void 0;
const web3_js_1 = require("@solana/web3.js");
const big_byte_1 = require("../big-byte");
const env_1 = __importDefault(require("../env"));
const big_integer_1 = __importDefault(require("big-integer"));
var Tx;
(function (Tx) {
    function bakeLine(programName, instruction, accounts) {
        let line = programName;
        line += " < ";
        instruction.forEach((i) => {
            line += i + " ";
        });
        line += ">";
        accounts.forEach((a) => {
            line += " " + a;
        });
        return line;
    }
    function createHashList(size) {
        return __awaiter(this, void 0, void 0, function* () {
            const space = size * 32 + 32;
            const lamports = yield env_1.default.connection.getMinimumBalanceForRentExemption(space);
            const idx = [0, 0, 0, 0].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(lamports.toString()), 8)))
                .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(space.toString()), 8)))
                .concat(Array.from(env_1.default.StakeProgram.toBytes()));
            return bakeLine("system", idx, ["Loader", "HashList"]);
        });
    }
    Tx.createHashList = createHashList;
    function deployHashList(size) {
        const idx = [6].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(size.toString()), 4)));
        return bakeLine("staking", idx, ["Loader", "Instance", "HashList"]);
    }
    Tx.deployHashList = deployHashList;
    function writeHashList(startIndex, endIndex, hashes) {
        const idx = [9].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(startIndex.toString()), 4)))
            .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)((endIndex - startIndex).toString()), 4)));
        let accounts = ["Loader", "Instance", "HashList"];
        for (let i = startIndex; i < endIndex; i++) {
            accounts.push((new web3_js_1.PublicKey(hashes[i])).toBase58());
        }
        return bakeLine("staking", idx, accounts);
    }
    Tx.writeHashList = writeHashList;
    function createRewardDescriptor(size) {
        return __awaiter(this, void 0, void 0, function* () {
            const space = Math.ceil(size / 32) * 32 + 32;
            const lamports = yield env_1.default.connection.getMinimumBalanceForRentExemption(space);
            const idx = [0, 0, 0, 0].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(lamports.toString()), 8)))
                .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(space.toString()), 8)))
                .concat(Array.from(env_1.default.StakeProgram.toBytes()));
            return bakeLine("system", idx, ["Loader", "RewardDescriptor"]);
        });
    }
    Tx.createRewardDescriptor = createRewardDescriptor;
    function deployRewardDescriptor() {
        const idx = [7];
        return bakeLine("staking", idx, ["Loader", "Instance", "RewardDescriptor"]);
    }
    Tx.deployRewardDescriptor = deployRewardDescriptor;
    function writeRewardDescriptor(startIndex, endIndex, array) {
        const idx = [10].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(startIndex.toString()), 4)))
            .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)((endIndex - startIndex).toString()), 4)));
        let accounts = ["Loader", "Instance", "RewardDescriptor"];
        for (let i = startIndex; i < endIndex; i++) {
            accounts.push(array[i].toBase58());
        }
        return bakeLine("staking", idx, accounts);
    }
    Tx.writeRewardDescriptor = writeRewardDescriptor;
    function createRewardList(depositCount) {
        return __awaiter(this, void 0, void 0, function* () {
            const space = Math.ceil(256 * depositCount / 4) * 32 + 32;
            const lamports = yield env_1.default.connection.getMinimumBalanceForRentExemption(space);
            const idx = [0, 0, 0, 0].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(lamports.toString()), 8)))
                .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(space.toString()), 8)))
                .concat(Array.from(env_1.default.StakeProgram.toBytes()));
            return bakeLine("system", idx, ["Loader", "RewardList"]);
        });
    }
    Tx.createRewardList = createRewardList;
    function deployRewardList() {
        const idx = [8];
        return bakeLine("staking", idx, ["Loader", "Instance", "RewardList"]);
    }
    Tx.deployRewardList = deployRewardList;
    function writeRewardList(startIndex, endIndex, array) {
        const idx = [11].concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)(startIndex.toString()), 4)))
            .concat(Array.from((0, big_byte_1.toLittleEndian)((0, big_integer_1.default)((endIndex - startIndex).toString()), 4)));
        let accounts = ["Loader", "Instance", "RewardList"];
        for (let i = startIndex; i < endIndex; i++) {
            accounts.push(array[i].toBase58());
        }
        return bakeLine("staking", idx, accounts);
    }
    Tx.writeRewardList = writeRewardList;
})(Tx = exports.Tx || (exports.Tx = {}));
