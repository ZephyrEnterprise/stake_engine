<template>
  <button class="button rounded-3 border-2"
          :class="nft.stake? 'nft_stk' : 'nft_btn'" :style="this.startTime.greater(BigInteger(this.nft.update_time))? 'pointer-events: none' : ''"
          v-on:click="choose(nft)" id="card"
          :disabled="activeNFT? nft.mint===activeNFT.mint : false">
    <div  v-if="this.startTime.greater(BigInteger(this.nft.update_time))" class="spinner-border roll" role="status"/>
    <div class="card nft_background">
      <img v-bind:src="this.nft.uri"
           class="rounded-3 card-img-top">
      <div class="card-body" style="padding: 0; margin: 0;">
        <div style="text-align: start; margin-left: 15px;">
          <a v-bind:href="prefix+this.nft.mint+postfix" target="_blank" class="text-decoration-none name_hover h6" style="background-color: transparent; border-color: transparent;">
            {{ nft.name }}
          </a>
          <div class="symbol">{{ nft.symbol}}</div>
        </div>
      </div>
    </div>
  </button>
</template>

<script>
import {env} from "@/helpers";
import BigInteger from "big-integer";
export default {
  name: "NFTCard",
  props: ['nft', 'choose', 'activeNFT', 'startTime'],
  data(){
    return{
      prefix: env.explorerAddressPrefix,
      postfix: env.explorerAddressPostfix,
      BigInteger: BigInteger
    }
  },
}
//<img v-bind:src="this.nft.uri"
//'https://picsum.photos/200/300'
</script>

<style scoped>
.button{
  background-color: transparent;
  margin: 5px;
  padding: 0;
}
.card{
  padding: 0px;
  width: 175px;
}
.roll{
  position: absolute;
  width: 38px;
  height: 38px;
  margin-top: 70px;
  margin-left: -19px;
  color: #ffffff;
  z-index: 1;
}
</style>