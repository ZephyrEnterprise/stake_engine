/* eslint-disable */
import BigInteger from 'big-integer';


const zero = BigInteger(0);
const one = BigInteger(1);
const n256 = BigInteger(256);


export function fromLittleEndian(bytes): BigInteger {
    let result = zero;
    let base = one;
    bytes.forEach(function (byte) {
        result = result.add(base.multiply(BigInteger(byte)));
        base = base.multiply(n256);
    });
    //@ts-ignore
    return result;
}

export function toLittleEndian(bigNumber, length): Uint8Array {
    //@ts-ignore
    let result: BigInteger = new Uint8Array(length);
    let i = 0;
    while (bigNumber.greater(zero)) {
        result[i] = bigNumber.mod(n256);
        bigNumber = bigNumber.divide(n256);
        i += 1;
    }
    return result;
}