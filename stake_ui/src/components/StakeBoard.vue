<template>
  <div v-if="isReady" class="board">
    <div class="container rounded-4 sign_board" style="position: fixed; width: 250px;">
      <ReloadSymbol :func="refreshTime" style="position: absolute; margin: 0 0 0 0;" v-if="isStaked"/>
      <div class="card border-2 rounded-3 preview_image" style="width: 175px; height: 175px; background-color: transparent; border-color: transparent">
        <img v-bind:src="this.nft.uri" class="rounded-3 card-img-top">
      </div>
      <div class="row">
        <div class="name">{{nft.name}}</div>
      </div>
      <div class="row">
        <div class="symbol">{{nft.symbol}}</div>
      </div>
      <div class="hr hl_inner"></div>
      <div v-if="!poolDrown">
        <div class="row" v-if="!isStaked">
          <h6 class="name row">Rewards for: {{this.time}}</h6>
        </div>
        <div class="row" v-else>
          <h6 class="name row">Rewards:</h6>
        </div>
        <div v-for="index in this.tokens.length" :key="index" style="width: fit-content">
          <div class="row" style="width: 250px;">
            <div class="name">
              {{displayFloat(rewards[index-1], decimals[index-1])}}
            </div>
            <DisplayToken :value="this.tokens[index-1]" :token="tokenRefs[index-1]" style="padding: 0"/>
          </div>
        </div>
        <div class="hr hl_inner"></div>
      </div>
      <h6 v-else class="row warning_letter">
        Pool can not provide rewards anymore
      </h6>
      <GreenButton v-if="!isStaked" text="Stake" style="margin: 10px 0 15px 0" :on-click="this.stake" :disabled="poolDrown"/>
      <div class="row" v-else>
        <GreenButton text="UnStake" style="margin: 10px 20px 15px 0;" :on-click="this.unStake" :is-short="true"/>
        <GreenButton text="Claim" style="margin: 10px 0 15px 0;" :on-click="this.claim" :disabled="poolDrown||!canClaim" :is-short="true"/>
      </div>
    </div>
  </div>
  <div v-else class="board"/>
</template>

<script lang="ts">
import {PublicKey} from "@solana/web3.js";
import {
  NFT,
  env,
  displayToken,
  displayFloat,
  displayTime,
  getTime,
  checkPoolToLock,
  getStake,
  stakeTX,
  calcClaimRewards,
  checkRewardPool,
  isZeroArray,
  unStakeTX,
  claimTX,
  calcRemainderTime
} from "@/helpers";
import DisplayToken from "@/components/DisplayToken.vue";
import BigInteger from "big-integer";
import ReloadSymbol from "@/components/ReloadButton.vue";
import GreenButton from "@/components/GreenButton.vue";
export default {
  name: "StakeBoard",
  components: {GreenButton, ReloadSymbol, DisplayToken},
  props: ['nftArray', 'activeIndex', 'instance', "wallet", 'set', 'signTx'],
  methods:{
    async refresh(){
      this.isReady = false;
      this.nft = this.nftArray[this.activeIndex];
      this.time = displayTime(this.instance.unit_time);
      if(this.nft.stake){
        const realTime: BigInteger = await getTime();
        const rewards: string[] = calcClaimRewards(this.nft, this.instance, realTime);
        this.poolDrown = !checkRewardPool(rewards, this.nft, this.instance);
        this.canClaim = !isZeroArray(rewards);
        this.rewards = rewards;
        this.isStaked = true;
      }
      else{
        this.rewards = this.nft.rewards;
        this.poolDrown = !checkPoolToLock(this.rewards, this.instance);
        this.isStaked = false;
      }
      this.isReady = true;
    },
    async refreshTime(){
      const realTime: BigInteger = await getTime();
      const rewards: string[] = calcClaimRewards(this.nft, this.instance, realTime);
      this.poolDrown = !checkRewardPool(rewards, this.nft, this.instance);
      this.canClaim = !isZeroArray(rewards);
      this.rewards = rewards;
    },
    async stake(){
      const stake = await getStake(new PublicKey(this.wallet), this.nft, this.instance);
      const tx = await stakeTX(new PublicKey(this.wallet), this.nft);
      if(! await this.signTx(tx)) return;
      this.nft.stake = stake;
      this.set(this.activeIndex, this.nft);
      await this.refresh();
    },
    async unStake(){
      const tx = await unStakeTX(new PublicKey(this.wallet), this.nft, this.instance);
      if(! await this.signTx(tx)) return;
      this.nft.stake = undefined;
      this.set(this.activeIndex, this.nft);
      await this.refresh();
    },
    async claim(){
      const realTime: BigInteger = await getTime();
      const tx = await claimTX(new PublicKey(this.wallet), this.nft, this.instance);
      if(! await this.signTx(tx)) return;
      this.nft.stake.start_time = calcRemainderTime(this.nft, this.instance, realTime);
      this.nft.stake.unit_time = this.instance.unit_time.toString();
      this.set(this.activeIndex, this.nft);
      await this.refresh();
    }
  },
  async mounted() {
    this.decimals = env.config.decimals;
    for(let i = 0; i < env.config.tokens.length; i++){
      this.tokens.push(await displayToken(env.config.tokens[i], true, true));
    }
    await this.refresh();
  },
  watch:{
    activeIndex:{
      async handler(){
        await this.refresh();
      }
    }
  },
  data(){
    return{
      isReady: false,
      isStaked: false,
      poolDrown: false,
      canClaim: false,
      nft: undefined as NFT,
      time: "",
      timeLeft: undefined as string,
      tokens: [] as string[],
      tokenRefs: env.config.tokens,
      rewards: [] as BigInteger[],
      decimals: [] as number[],
      displayFloat: displayFloat,
    }
  }
}
</script>

<style scoped>
.container{
  padding: 0px 10px 0px 10px;
  display: inline-grid;
  justify-self: center;
  width: fit-content;
}
.preview_image{
  align-self: center;
  margin: 10px;
  justify-self: center;
}
</style>