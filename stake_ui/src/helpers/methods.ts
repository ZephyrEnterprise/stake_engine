/* eslint-disable */
import {PublicKey} from "@solana/web3.js";
import {
    env,
    Instance,
    NFT,
    Stake,
    parseVault,
    parseRewardList,
    parseRewardDescriptor,
    parseMetadata,
    getMetadataAddress,
    parseStake,
    parseLock,
    fetchMetadata,
} from "./index";
import splToken from "@solana/spl-token";
import BigInteger from "big-integer";


export async function searchForNFTS(wallet: PublicKey, array: NFT[], spec: number){
    const hashList = env.config.hashes;
    const usedHashes: Set<string> = new Set();
    const RewardDescriptor = await parseRewardDescriptor(env.RewardDescriptor);
    const RewardList = await parseRewardList(env.RewardList);
    let index = 0;
    while(index < array.length){
        try{
            let nft = array[index];
            if(nft.stake){
                switch(spec){
                    case 0:
                        nft.stake = await parseStake(nft.stake.address);
                        if(nft.stake.finished) throw "Already finished";
                        break;
                    case 1:
                        nft.stake = await parseLock(nft.stake.address);
                        if(nft.stake.finished) throw "Already finished";
                        break;
                }
            }
            else{
                const a = await parseVault(nft.associated_token);
                if(a.amount.toString()!=="1") throw "Not own any more";

            }
            nft.update_time = getLocalTime().toString();
            nft.rewardIndex = RewardDescriptor.positions[index];
            nft.rewards = RewardList.rewards[nft.rewardIndex];
            array[index] = nft;
            usedHashes.add(nft.mint);
            index++;
        }
        catch(e){
            array.splice(index, 1);
        }
    }
    const accounts = await env.connection.getParsedProgramAccounts(
        env.TokenProgram,
        {
            filters: [
                {
                    dataSize: 165,
                },
                {
                    memcmp: {
                        offset: 32,
                        //@ts-ignore
                        bytes: wallet,
                    },
                },
            ],
        }
    );
    for(let i = 0; i < accounts.length; i++){
        try{
            const a = await parseVault(accounts[i].pubkey);
            if(!a) continue;
            if(a.amount.toString()!=="0" && a.amount.toString()!=="1") continue;
            const hash = a.mint.toBase58();
            if(usedHashes.has(hash)) continue;
            const index = hashList.indexOf(hash);
            if(index < 0) continue;
            const rewardIndex = RewardDescriptor.positions[index];
            const rewards: string[] = RewardList.rewards[rewardIndex];
            const meta = await getMetadataAddress(a.mint);
            const metadata = await parseMetadata(meta);
            let stake: Stake|undefined = undefined;
            if(a.amount.toString()==="0"){
                const stake_a = (await PublicKey.findProgramAddress(
                    [
                        Buffer.from('stake'),
                        env.StakeProgram.toBuffer(),
                        env.instanceMint.toBuffer(),
                        env.instanceOwner.toBuffer(),
                        a.mint.toBuffer(),
                        wallet.toBuffer()
                    ],
                    env.StakeProgram
                ))[0];
                switch(spec){
                    case 0:
                        stake = await parseStake(stake_a);
                        if(!stake) continue;
                        if(stake.finished) continue;
                        break;
                    case 1:
                        stake = await parseLock(stake_a);
                        if(!stake) continue;
                        if(stake.finished) continue;
                        break;
                }
            }
            const fetched = await fetchMetadata(metadata.data.uri);
            array.push({
                mint: a.mint,
                associated_token: a.address,
                stake: stake,
                index,
                rewardIndex,
                rewards,
                uri: fetched.uri,
                name: fetched.name,
                symbol: fetched.symbol,
                update_time: getLocalTime().toString(),
            });
        }
        catch(e){
            continue;
        }
    }

}

export function calcClaimRewards(nft: NFT, instance: Instance, time: BigInteger): string[]{
    let oldUnits: BigInteger, newUnits: BigInteger;
    //@ts-ignore
    if(instance.update_time.greater(BigInteger(nft.stake.start_time))){
        //@ts-ignore
        oldUnits = instance.update_time.subtract(BigInteger(nft.stake.start_time)).divide(BigInteger(nft.stake.unit_time));
        //@ts-ignore
        const remain: BigInteger = time.subtract(BigInteger(nft.stake.start_time)).subtract(oldUnits.multiply(BigInteger(nft.stake.unit_time)));
        //@ts-ignore
        newUnits = remain.divide(instance.unit_time);
    }
    else{
        //@ts-ignore
        newUnits = BigInteger("0");
        //@ts-ignore
        oldUnits = time.subtract(BigInteger(nft.stake.start_time)).divide(BigInteger(nft.stake.unit_time));
    }
    let rewards: string[] = [];
    for(let i = 0; i < instance.vaults.length; i++){
        //@ts-ignore
        rewards.push(oldUnits.multiply(BigInteger(nft.stake.rewards[i])).add(newUnits.multiply(BigInteger(nft.rewards[i]))).toString());
    }
    return rewards;
}

export function calcRemainderTime(nft: NFT, instance: Instance, time: BigInteger): string{
    let oldUnits: BigInteger, newUnits: BigInteger, remainder: BigInteger;
    //@ts-ignore
    if(instance.update_time.greater(BigInteger(nft.stake.start_time))){
        //@ts-ignore
        oldUnits = instance.update_time.subtract(BigInteger(nft.stake.start_time)).divide(BigInteger(nft.stake.unit_time));
        //@ts-ignore
        const remain: BigInteger = time.subtract(BigInteger(nft.stake.start_time)).subtract(oldUnits.multiply(BigInteger(nft.stake.unit_time)));
        //@ts-ignore
        newUnits = remain.divide(instance.unit_time);
        //@ts-ignore
        remainder = remain.subtract(newUnits.multiply(instance.unit_time));
    }
    else{
        //@ts-ignore
        newUnits = BigInteger("0");
        //@ts-ignore
        oldUnits = time.subtract(BigInteger(nft.stake.start_time)).divide(BigInteger(nft.stake.unit_time));
        //@ts-ignore
        remainder = time.subtract(BigInteger(nft.stake.start_time)).subtract(oldUnits.multiply(BigInteger(nft.stake.unit_time)));
    }
    //@ts-ignore
    return time.subtract(remainder).toString();
}

//@ts-ignore
export async function getTime(): Promise<BigInteger>{
    const slot = await env.connection.getSlot();
    const timestamp = await env.connection.getBlockTime(slot);
    //@ts-ignore
    return BigInteger(timestamp.toString());
}

export function getLocalTime(): BigInteger {
    const date = new Date();
    //@ts-ignore
    return BigInteger((date.getTime()).toString());
}

export function checkPoolToLock(rewards: string[], instance: Instance): boolean{
    for(let i = 0; i < instance.vaults.length; i++){
        //@ts-ignore;
        if(BigInteger(rewards[i]).greater(BigInteger(instance.pledges[i]))){
            return false;
        }
    }
    return true;
}

export function checkRewardPool(rewards: string[], nft: NFT, instance: Instance): boolean{
    let res = true;
    for(let i = 0; i < instance.vaults.length; i++){
        //@ts-ignore
        if(BigInteger(rewards[i]).greater(BigInteger(nft.rewards[i]).add(instance.pledges[i]))){
            //@ts-ignore
            rewards[i] = nft.rewards[i];
            res = false;
        }
    }
    return res;
}

export function isZeroArray(array: string[]): boolean{
    let res = false;
    array.forEach((a) => {
        if(a==="0"){
            res = true;
        }
    })
    return res;
}

export async function getLock(wallet: PublicKey, nft: NFT, instance: Instance): Promise<Stake>{
    const stake = (await PublicKey.findProgramAddress(
        [
            Buffer.from('stake'),
            env.StakeProgram.toBuffer(),
            env.instanceMint.toBuffer(),
            env.instanceOwner.toBuffer(),
            new PublicKey(nft.mint).toBuffer(),
            wallet.toBuffer()
        ],
        env.StakeProgram
    ))[0];
    const vault = (await PublicKey.findProgramAddress(
        [
            Buffer.from('vault'),
            env.StakeProgram.toBuffer(),
            env.instanceMint.toBuffer(),
            env.instanceOwner.toBuffer(),
            new PublicKey(nft.mint).toBuffer(),
        ],
        env.StakeProgram
    ))[0];
    return {
        address: stake.toBase58(),
        vault: vault.toBase58(),
        start_time: undefined,
        //@ts-ignore
        end_time: (await getTime()).add(instance.unit_time).toString(),
        unit_time: undefined,
        rewards: nft.rewards,
        finished: false
    };
}

export async function getStake(wallet: PublicKey, nft: NFT, instance: Instance): Promise<Stake>{
    const stake = (await PublicKey.findProgramAddress(
        [
            Buffer.from('stake'),
            env.StakeProgram.toBuffer(),
            env.instanceMint.toBuffer(),
            env.instanceOwner.toBuffer(),
            new PublicKey(nft.mint).toBuffer(),
            wallet.toBuffer()
        ],
        env.StakeProgram
    ))[0];
    const vault = (await PublicKey.findProgramAddress(
        [
            Buffer.from('vault'),
            env.StakeProgram.toBuffer(),
            env.instanceMint.toBuffer(),
            env.instanceOwner.toBuffer(),
            new PublicKey(nft.mint).toBuffer(),
        ],
        env.StakeProgram
    ))[0];
    return {
        address: stake.toBase58(),
        vault: vault.toBase58(),
        start_time: (await getTime()).toString(),
        //@ts-ignore
        end_time: undefined,
        unit_time: instance.unit_time.toString(),
        rewards: nft.rewards,
        finished: false
    };
}