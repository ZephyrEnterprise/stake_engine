/* eslint-disable */
import {PublicKey, Transaction, TransactionInstruction, AccountMeta} from "@solana/web3.js";
import {env, NFT, Instance, toLittleEndian, getAssociatedAccount, Stake, getTime} from "./index";
import BigInteger from "big-integer";


export async function stakeTX(wallet: PublicKey, nft: NFT): Promise<Transaction>{
    const stake: PublicKey = (await PublicKey.findProgramAddress(
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
    const vault: PublicKey = (await PublicKey.findProgramAddress(
        [
            Buffer.from('vault'),
            env.StakeProgram.toBuffer(),
            env.instanceMint.toBuffer(),
            env.instanceOwner.toBuffer(),
            new PublicKey(nft.mint).toBuffer(),
        ],
        env.StakeProgram
    ))[0];
    const accounts: AccountMeta[] = [
        {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: env.instanceAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.HashList,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.RewardDescriptor,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.RewardList,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.mint),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.associated_token),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: vault,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: stake,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.SystemProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.TokenProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.Sysvar,
            isSigner: false,
            isWritable: false,
        },
    ];
    const idx = [0]
        .concat(Array.from(toLittleEndian(BigInteger(nft.index.toString()), 4)))
        .concat([nft.rewardIndex]);
    const tx = new Transaction();
    tx.add(
        new TransactionInstruction({
            programId: env.StakeProgram,
            keys: accounts,
            data: Buffer.from(new Uint8Array(idx)),
        })
    );
    return tx;
}

export async function unStakeTX(wallet: PublicKey, nft: NFT, instance: Instance): Promise<Transaction>{
    let accounts: AccountMeta[] = [
        {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: env.instanceAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.HashList,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.RewardDescriptor,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.RewardList,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.mint),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.associated_token),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.stake.vault),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.stake.address),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.SystemProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.TokenProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.AssociatedProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.Sysvar,
            isSigner: false,
            isWritable: false,
        },
    ];
    for(let i = 0; i < instance.vaults.length; i++){
        if(env.config.tokens[i]===env.SystemProgram.toBase58()){
            accounts = accounts.concat(
                [
                    {
                        pubkey: env.SystemProgram,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: instance.treasury,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: wallet,
                        isSigner: false,
                        isWritable: true,
                    },
                ]
            );
        }
        else{
            accounts = accounts.concat(
                [
                    {
                        pubkey: new PublicKey(env.config.tokens[i]),
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: instance.vaults[i],
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: await getAssociatedAccount(wallet, new PublicKey(env.config.tokens[i])),
                        isSigner: false,
                        isWritable: true,
                    },
                ]
            );
        }
    }
    const idx = [1]
        .concat(Array.from(toLittleEndian(BigInteger(nft.index.toString()), 4)))
        .concat([nft.rewardIndex]);

    const tx = new Transaction();
    tx.add(
        new TransactionInstruction({
            programId: env.StakeProgram,
            keys: accounts,
            data: Buffer.from(new Uint8Array(idx)),
        })
    );
    return tx;
}

export async function claimTX(wallet: PublicKey, nft: NFT, instance: Instance): Promise<Transaction>{
    const tx = await unStakeTX(wallet, nft, instance);
    tx.instructions[0].data[0] = 2;
    return tx;
}

export async function lockTX(wallet: PublicKey, nft: NFT): Promise<Transaction>{
    const tx = await stakeTX(wallet, nft);
    tx.instructions[0].data[0] = 3;
    console.log(tx)
    return tx;
}

export async function unLockTX(wallet: PublicKey, nft: NFT, instance: Instance): Promise<Transaction>{
    let accounts: AccountMeta[] = [
        {
            pubkey: wallet,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: env.instanceAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.associated_token),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.stake.vault),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: new PublicKey(nft.stake.address),
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: env.SystemProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.TokenProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.AssociatedProgram,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: env.Sysvar,
            isSigner: false,
            isWritable: false,
        },
    ];
    for(let i = 0; i < instance.vaults.length; i++){
        if(env.config.tokens[i]===env.SystemProgram.toBase58()){
            accounts = accounts.concat(
                [
                    {
                        pubkey: env.SystemProgram,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: instance.treasury,
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: wallet,
                        isSigner: false,
                        isWritable: true,
                    },
                ]
            )
        }
        else{
            accounts = accounts.concat(
                [
                    {
                        pubkey: new PublicKey(env.config.tokens[i]),
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: instance.vaults[i],
                        isSigner: false,
                        isWritable: true,
                    },
                    {
                        pubkey: await getAssociatedAccount(wallet, new PublicKey(env.config.tokens[i])),
                        isSigner: false,
                        isWritable: true,
                    },
                ]
            )
        }
    }
    const tx = new Transaction();
    tx.add(
        new TransactionInstruction({
            programId: env.StakeProgram,
            keys: accounts,
            data: Buffer.from(new Uint8Array([4])),
        })
    );
    return tx;
}