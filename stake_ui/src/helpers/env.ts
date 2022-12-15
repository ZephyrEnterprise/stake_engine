/* eslint-disable */
import {PublicKey, Connection} from "@solana/web3.js";
import {Config} from "./index";
import _config from "../../client_config.json";
import {Provider} from "@project-serum/anchor";


export const config =  _config as Config;
if(!config) throw "Can not find client_config.json";

export let connection: Connection;
export let provider: any = undefined;
export const explorerAddressPrefix = "https://explorer.solana.com/address/";
export let explorerAddressPostfix: string;

const url_pool = [
    "https://solemn-little-liquid.solana-mainnet.discover.quiknode.pro/124f651e938b235c20642782862dcf5ad30b0a0f/",
    "https://solana-mainnet.g.alchemy.com/v2/yM05jb0qZ9cXBTMJJBHQqKq7sbQZCx-q",
    "https://sly-responsive-glade.solana-mainnet.discover.quiknode.pro/8d10cc2c4c8c0c725a022ae1a80b26c6ce3cd742/"];
const wss_pool = [
    "wss://solemn-little-liquid.solana-mainnet.discover.quiknode.pro/124f651e938b235c20642782862dcf5ad30b0a0f/",
    "wss://solana-mainnet.g.alchemy.com/v2/yM05jb0qZ9cXBTMJJBHQqKq7sbQZCx-q",
    "wss://sly-responsive-glade.solana-mainnet.discover.quiknode.pro/8d10cc2c4c8c0c725a022ae1a80b26c6ce3cd742/"];
let url_indexes_left = [0, 1, 2];
let active_index = 0;
let active_url = "";

function switchUrl(){
    if(url_indexes_left.length === 0) return false;
    const index = Math.floor(Math.random()*url_indexes_left.length);
    const new_index = url_indexes_left[index];
    url_indexes_left.splice(index, 1);
    console.log("Switching Url:", url_pool[active_index], "->", url_pool[new_index]);
    active_url = url_pool[new_index];
    provider.value.connection._rpcEndpoint = url_pool[new_index];
    provider.value.connection._rpcWsEndpoint = wss_pool[new_index];
    provider.value.connection._rpcWebSocket.address = wss_pool[new_index];
    active_index = new_index;
    return true;
}

async function fetchFunc(url, data){
    let switch_res = true;
    while(switch_res){
        try{
            const res = await fetch(active_url, data);
            if((res.status >= 200 && res.status < 300) || res.status === 400) return res;
            switch_res = switchUrl();
        }
        catch (e){
            switch_res = switchUrl();
        }
    }
    throw "Cannot connect to Solana node";
}

export function setProvider(_provider: any){
    provider = _provider;
}

if(config.custom_endpoint && config.custom_endpoint != ""){
    connection = new Connection(config.custom_endpoint);
    switch(config.web){
        case "mainnet":
            explorerAddressPostfix = "?cluster=mainnet";
            break;
        case "devnet":
            explorerAddressPostfix = "?cluster=devnet";
            break;
        case "testnet":
            explorerAddressPostfix = "?cluster=testnet";
            break;
    }
}
else{
    switch(config.web){
        case "mainnet":
            active_index = Math.floor(Math.random()*url_indexes_left.length);
            active_url = url_pool[active_index];
            connection = new Connection(active_url, {fetch: fetchFunc});
            explorerAddressPostfix = "?cluster=mainnet";
            break;
        case "devnet":
            connection = new Connection("https://api.devnet.solana.com");
            explorerAddressPostfix = "?cluster=devnet";
            break;
        case "testnet":
            connection = new Connection("https://api.testnet.solana.com");
            explorerAddressPostfix = "?cluster=testnet";
            break;
    }
}
console.log("Current cluster:", config.web, "Url:", connection.rpcEndpoint);

export const instanceAddress = new PublicKey(config.instance);
export const instanceMint = new PublicKey(config.mint);
export const instanceOwner = new PublicKey(config.owner);
export const HashList = new PublicKey(config.hashList);
export const RewardList = new PublicKey(config.rewardList);
export const RewardDescriptor = new PublicKey(config.rewardDescriptor);

export const StakeProgram = new PublicKey("StaXxEPJNmvNzXox4WpsGkeVCieKV1bNrYnCQybaSnQ");
export const SystemProgram = new PublicKey("11111111111111111111111111111111");
export const TokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
export const MetadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
export const AssociatedProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
export const Sysvar = new PublicKey("SysvarRent111111111111111111111111111111111");

export const USDT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
export const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
export const BUSD = new PublicKey("5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2");

