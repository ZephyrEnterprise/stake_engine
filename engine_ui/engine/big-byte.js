"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLittleEndian = exports.fromLittleEndian = void 0;
const BigInteger = require('big-integer');
const zero = BigInteger(0);
const one = BigInteger(1);
const n256 = BigInteger(256);
function fromLittleEndian(bytes) {
    let result = zero;
    let base = one;
    bytes.forEach(function (byte) {
        result = result.add(base.multiply(BigInteger(byte)));
        base = base.multiply(n256);
    });
    return result;
}
exports.fromLittleEndian = fromLittleEndian;
function toLittleEndian(bigNumber, length) {
    let result = new Uint8Array(length);
    let i = 0;
    while (bigNumber.greater(zero)) {
        result[i] = bigNumber.mod(n256);
        bigNumber = bigNumber.divide(n256);
        i += 1;
    }
    return result;
}
exports.toLittleEndian = toLittleEndian;
