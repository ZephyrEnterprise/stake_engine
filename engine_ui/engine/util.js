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
exports.execAsync = exports.getMetadataAddress = exports.getDateFormated = void 0;
const web3_js_1 = require("@solana/web3.js");
const env_1 = __importDefault(require("./env"));
function getDateFormated() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    return month.toString() + "." + day.toString() + "." + year.toString();
}
exports.getDateFormated = getDateFormated;
function getMetadataAddress(mint) {
    return __awaiter(this, void 0, void 0, function* () {
        const a = yield web3_js_1.PublicKey.findProgramAddress([
            Buffer.from('metadata'),
            env_1.default.MetadataProgram.toBuffer(),
            mint.toBuffer(),
        ], env_1.default.MetadataProgram);
        return a[0];
    });
}
exports.getMetadataAddress = getMetadataAddress;
function execAsync(func) {
    return new Promise(() => setTimeout(func, 0));
}
exports.execAsync = execAsync;
