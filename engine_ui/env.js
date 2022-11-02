const {PublicKey, Connection} = require("@solana/web3.js");
const config = require("./data/config.json");


const explorerAddressPrefix = "https://explorer.solana.com/address/";
let explorerAddressPostfix = "?cluster=devnet";
let connection = new Connection("https://api.devnet.solana.com");

if(!config) throw "Error while loading config";
switch(config.web) {
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

const StakeProgram= new PublicKey("StaXxEPJNmvNzXox4WpsGkeVCieKV1bNrYnCQybaSnQ");
const SystemProgram = new PublicKey("11111111111111111111111111111111");
const TokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const MetadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const AssociatedProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const Sysvar = new PublicKey("SysvarRent111111111111111111111111111111111");

const Zarve = new PublicKey("Zarv1CojtAVv4GJB1f5cNrJRihsb3SHkcwuySV7iEQQ");
const Deployer = new PublicKey("DepXnXdB4oxDLmJHh7M5VJqEKt4RroEfrAsdj1dJkFTm");
const StableList = new PublicKey("pbcVP51PEuou6HZi37NovQaeb2sfKuHmSBPsGRyumc8");

const USDT = new PublicKey("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB");
const USDC = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const BUSD = new PublicKey("5RpUwQ8wtdPCZHhu6MERp2RGrpobsbZ6MH5dDHkUjs2");

const PORT =  7000;

module.exports = {connection, explorerAddressPrefix, explorerAddressPostfix, StakeProgram, SystemProgram, TokenProgram, MetadataProgram, AssociatedProgram, Sysvar,
                    USDT, USDC, BUSD, PORT, Zarve, Deployer, StableList};