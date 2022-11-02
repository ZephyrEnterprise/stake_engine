/* eslint-disable */
import BigInteger from "big-integer";
import {PublicKey} from "@solana/web3.js";
import {env} from "./index";
import {getMetadataAddress, parseMetadata} from "./index";


function remZeros(value){
    let index = value.length -1;
    while(index > 0 && value[index] === '0') index--;
    return value.slice(0, index+1);
}

export function displayFloat(num: BigInteger|string, decimals: number): string{
    if(typeof(num) !== "string"){
        num = num.toString();
    }
    if(num === "0"){
        return "0";
    }
    if(decimals === 0){
        return num+",0";
    }
    if(num.length < (decimals+1)){
        const shift = (decimals+1) - num.length;
        const str = new Array(shift+1).join( '0' );
        num = str + num;
    }
    let complete = num.slice(0, -decimals);
    let fraction = remZeros(num.slice(-decimals))
    let index = 0;
    while((index < (fraction.length+1)) && (fraction[index]==='0')) index++;
    let end = index;
    for(let j = index; (j < fraction.length)&&(j < (index + 4)); j++) end++;
    fraction = fraction.slice(0, end);
    return complete + "," + fraction;
}

export function displayTime(unix: BigInteger|string): string{
    if(typeof(unix)==="string"){
        //@ts-ignore
        unix = BigInteger(unix);
    }
    const sixty = BigInteger(60);
    const twentyfour = BigInteger(24);
    // @ts-ignore
    let rem = unix.divide(sixty);
    // @ts-ignore
    const seconds = unix.subtract(rem.multiply(sixty));
    unix = rem;
    // @ts-ignore
    rem = unix.divide(sixty);
    // @ts-ignore
    const minutes = unix.subtract(rem.multiply(sixty));
    const days = rem.divide(twentyfour);
    const hours = rem.subtract(days.multiply(twentyfour));
    return (days>0? days.toString()+"d ": "")
        +(hours>0? hours.toString()+"h ": "")
        +(minutes>0? minutes.toString()+"m ": "")
        +(seconds>0? seconds.toString()+"s ": "");
}

export async function displayToken(key, isShort, isToken): Promise<string>{
    if(typeof(key) !== "string"){
        key = key.toBase58();
    }
    if(!isToken){
        if(isShort){
            return key.slice(0, 5)+"..."+key.slice(-5);
        }
        return key;
    }
    if(key === env.SystemProgram.toBase58()){
        return "SOL";
    }
    if(key === env.USDT.toBase58()){
        return "USDT";
    }
    if(key === env.USDC.toBase58()){
        return "USDC";
    }
    if(key === env.BUSD.toBase58()){
        return "BUSD";
    }
    const meta_ai = await getMetadataAddress(new PublicKey(key));
    const metadata = await parseMetadata(meta_ai);
    if(metadata){
        return metadata.data.symbol.toString().split('\x00', 1)[0];
    }
    if(isShort){
        return key.slice(0, 5)+"..."+key.slice(-5);
    }
    return key;
}