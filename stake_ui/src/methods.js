const {PublicKey} = require("@solana/web3.js");
const env = require("../env");


// ++++++++++ Internal helpers ++++++++++
function remZeros(value){
    let index = value.length -1;
    while(index > 0 && value[index] === '0') index--;
    return value.slice(0, index+1);
}
// ++++++++++ Display vales as String ++++++++++
function displayFloat(num, decimals){
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
    let fraction = remZeros(num.slice(-decimals));
    let index = 0;
    while((index < (fraction.length+1)) && (fraction[index]==='0')) index++;
    let end = index;
    for(let j = index; (j < fraction.length)&&(j < (index + 4)); j++) end++;
    fraction = fraction.slice(0, end);
    return complete + "," + fraction;
}
// ++++++++++ Interacting with On-Chain ++++++++++
async function getBalance(key){
    if(typeof(key) === "string"){
        key = new PublicKey(key);
    }
    return await env.connection.getBalance(key);
}


module.exports = {displayFloat, getBalance};