import {PublicKey} from "@solana/web3.js";
import BigInteger from "big-integer";


export interface Stake{
    address: string,
    vault: string,
    start_time: string|undefined,
    end_time: string|undefined,
    unit_time: string|undefined,
    rewards: string[],
    finished: boolean
}

export interface NFT{
    mint: string,
    associated_token: string,
    stake: Stake|undefined,
    index: number,
    rewardIndex: number,
    rewards: string[],
    uri: string,
    name: string,
    symbol: string,
    update_time: string
}

export interface Config{
    web: "mainnet"|"devnet"|"testnet",
    owner: string,
    instance: string,
    mint: string,
    hashList: string,
    rewardDescriptor: string,
    rewardList: string,
    tokens: string[],
    decimals: number[],
    hashes: string[]
}

export interface Instance{
    spec: number,
    state: number,
    treasury: PublicKey,
    vaults: PublicKey[],
    pledges: BigInteger[],
    unit_time: BigInteger,
    update_time: BigInteger
}

export interface RewardDescriptor{
    positions: number[]
}
export interface RewardList{
    rewards: string[][]
}

