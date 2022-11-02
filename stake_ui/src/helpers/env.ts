import {PublicKey, Connection} from "@solana/web3.js";
import {Config} from "./index";
import _config from "../../client_config.json";


export const config =  _config as Config;
if(!config) throw "Can not find client_config.json";

export let connection: Connection;
export const explorerAddressPrefix = "https://explorer.solana.com/address/";
export let explorerAddressPostfix: string;

switch(config.web){
    case "mainnet":
        connection = new Connection("https://api.mainnet-beta.solana.com");
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

