const {PublicKey, Connection} = require("@solana/web3.js");


const explorerAddressPrefix = "https://explorer.solana.com/address/";
let explorerAddressPostfix = "?cluster=devnet";
let connection = new Connection("https://api.devnet.solana.com");


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

const PORT = 3001;


let Web = {StakeProgram, SystemProgram, TokenProgram, MetadataProgram, AssociatedProgram, Sysvar, provider: undefined,
                    USDT, USDC, BUSD, PORT, Zarve, Deployer, StableList, connection, explorerAddressPrefix, explorerAddressPostfix};


function getWeb(){
    return Web;
}

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
    Web.provider.value.connection._rpcEndpoint = url_pool[new_index];
    Web.provider.value.connection._rpcWsEndpoint = wss_pool[new_index];
    Web.provider.value.connection._rpcWebSocket.address = wss_pool[new_index];
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

function switchWeb(config){
    switch(config.web) {
        case "mainnet":
            active_index = Math.floor(Math.random()*url_indexes_left.length);
            active_url = url_pool[active_index];
            Web.connection = new Connection(active_url, {fetch: fetchFunc});
            Web.explorerAddressPostfix = "?cluster=mainnet";
            break;
        case "devnet":
            Web.connection = new Connection("https://api.devnet.solana.com");
            Web.explorerAddressPostfix = "?cluster=devnet";
            break;
        case "testnet":
            Web.connection = new Connection("https://api.testnet.solana.com");
            Web.explorerAddressPostfix = "?cluster=testnet";
            break;
    }
    console.log("Current cluster:", config.web, "Url:", Web.connection._rpcEndpoint);
}

function setProvider(provider){
    Web.provider = provider
}


module.exports = {getWeb, switchWeb, setProvider};