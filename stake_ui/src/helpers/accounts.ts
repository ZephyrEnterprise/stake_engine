import {PublicKey} from "@solana/web3.js";
import {env} from "./index";


export async function getMetadataAddress(mint: PublicKey): Promise<PublicKey>{
    const a = await PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            env.MetadataProgram.toBuffer(),
            mint.toBuffer(),
        ],
        env.MetadataProgram,
    );
    return a[0];
}

export async function getAssociatedAccount(owner: PublicKey, mint: PublicKey): Promise<PublicKey>{
    return (await PublicKey.findProgramAddress(
        [
            owner.toBuffer(),
            env.TokenProgram.toBuffer(),
            mint.toBuffer(),
        ],
        env.AssociatedProgram
    ))[0];
}