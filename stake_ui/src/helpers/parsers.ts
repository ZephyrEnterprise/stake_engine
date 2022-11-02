/* eslint-disable */
import {PublicKey} from "@solana/web3.js";
import {Stake, Instance, RewardList, RewardDescriptor} from "./index";
import BN from "bn.js";
import BigInteger from "big-integer";
import {fromLittleEndian} from "./index";
import {env} from "./index";
import {Metadata} from "@metaplex-foundation/mpl-token-metadata";
const splToken = require("@solana/spl-token");
import axios from "axios";


export async function parseMetadata(record: PublicKey|string): Promise<Metadata|undefined>{
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        return await Metadata.fromAccountAddress(env.connection, record);
    }
    catch(e){
        return undefined;
    }
}

export async function fetchMetadata(uri: string){
    const metadata = await axios.get(uri)
        .then(function (response) {
            return response.data;
        });
    return {
        uri: metadata.image,
        name: metadata.name,
        symbol: metadata.symbol,
    }
}

export async function parseVault(record: PublicKey|string){
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        //@ts-ignore
        return await splToken.getAccount(env.connection, record, env.SystemProgram);
    }
    catch(e){
        console.log(e)
        return undefined;
    }
}

export async function parseInstance(record: PublicKey): Promise<Instance>{
    try{
        // @ts-ignore
        const data = (await env.connection.getAccountInfo(record)).data;
        const unit_time = fromLittleEndian(data.slice(129, 137));
        const update_time = fromLittleEndian(data.slice(137, 145));
        const spec = (new BN(data.slice(145, 146), "le").toNumber());
        const state = (new BN(data.slice(146, 147), "le").toNumber());
        const treasury = new PublicKey(data.slice(248, 280));
        let vaults: PublicKey[] = [];
        let pledges: BigInteger[] = [];
        const deposit_count = new BN(data.slice(281, 285), "le").toNumber();
        for(let i = 0; i < deposit_count; i++){
            vaults.push(new PublicKey(data.slice(285 + i * 40, 317 + i * 40)));
            pledges.push(fromLittleEndian(data.slice(317 + i * 40, 325 + i * 40)));
        }
        return{
            spec,
            state,
            treasury,
            vaults,
            pledges,
            unit_time,
            update_time
        }
    }
    catch(e){
        throw "Cannot find Instance";
    }
}

export async function parseStake(record: PublicKey|string): Promise<Stake|undefined>{
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        // @ts-ignore
        const data = (await env.connection.getAccountInfo(record)).data;
        const state = new BN(data.slice(0, 1), "le").toNumber();
        const start_time = fromLittleEndian(data.slice(97, 105));
        const unit_time = fromLittleEndian(data.slice(105, 113));
        const vault = new PublicKey(data.slice(113, 145));
        const vault_count = new BN(data.slice(145, 149), "le").toNumber();
        let rewards: string[] = [];
        for(let i = 0; i < vault_count; i++){
            rewards.push(fromLittleEndian(data.slice(149 + i*8, 157 + i*8)).toString());
        }
        return {
            address: record.toBase58(),
            vault: vault.toBase58(),
            start_time: start_time.toString(),
            end_time: undefined,
            unit_time: unit_time.toString(),
            rewards,
            finished: state===7
        }
    }
    catch(e){
        return undefined;
    }
}

export async function parseLock(record: PublicKey|string): Promise<Stake|undefined>{
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        // @ts-ignore
        const data = (await env.connection.getAccountInfo(record)).data;
        const state = new BN(data.slice(0, 1), "le").toNumber();
        const end_time = fromLittleEndian(data.slice(97, 105));
        const vault = new PublicKey(data.slice(113, 145));
        const vault_count = new BN(data.slice(145, 149), "le").toNumber();
        let rewards: string[] = [];
        for(let i = 0; i < vault_count; i++){
            rewards.push(fromLittleEndian(data.slice(149 + i*8, 157 + i*8)).toString());
        }
        return {
            address: record.toBase58(),
            vault: vault.toBase58(),
            start_time: undefined,
            end_time: end_time.toString(),
            unit_time: undefined,
            rewards,
            finished: state===8
        }
    }
    catch(e){
        return undefined;
    }
}

export async function parseRewardDescriptor(record: PublicKey|string): Promise<RewardDescriptor>{
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        // @ts-ignore
        const data = (await env.connection.getAccountInfo(record)).data;
        const length = data.length;
        let pos: number[] = [];
        for(let i = 32; i < length; i++){
            pos.push(new BN(data.slice(i, i+1), "le").toNumber());
        }
        return {
            positions: pos
        }
    }
    catch(e){
        throw "Can find Reward Descriptor";
    }
}

export async function parseRewardList(record: PublicKey|string): Promise<RewardList>{
    try{
        if(typeof(record)==="string"){
            record  = new PublicKey(record);
        }
        // @ts-ignore
        const data = (await env.connection.getAccountInfo(record)).data;
        const depositCount = env.config.tokens.length;
        let rewards: string[][] = [];
        for(let i = 0; i < 256; i++){
            let row: string[] = [];
            for(let j  = 0; j < depositCount; j++){
                row.push(fromLittleEndian(data.slice(32+j*8+i*(8*depositCount), 40+j*8+i*(8*depositCount))).toString());
            }
            rewards.push(row);
        }
        return {
            rewards
        }
    }
    catch(e){
        throw "Can find Reward List";
    }
}