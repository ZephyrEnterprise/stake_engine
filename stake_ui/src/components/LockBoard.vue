<template>
  <div v-if="isReady" class="board">
    <div class="container rounded-4 sign_board" style="position: fixed; width: 250px;" >
      <ReloadSymbol :func="refreshTime" style="position: absolute; margin: 0 0 0 0;" v-if="isLocked&&timeLeft"/>
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
        <div class="row" v-if="!isLocked">
          <h6 class="name row">Rewards for: {{this.time}}</h6>
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
      <GreenButton v-if="isLocked" :text="timeLeft? timeLeft: 'UnLock'" style="margin: 10px 0 15px 0" :on-click="this.unLock" :disabled="timeLeft"/>
      <GreenButton v-else text="Lock" style="margin: 10px 0 15px 0" :on-click="this.lock" :disabled="poolDrown"/>
    </div>
  </div>
  <div v-else class="board"/>

</template>

<script lang="ts">
import {PublicKey} from "@solana/web3.js";
import {
  displayTime,
  NFT,
  env,
  displayToken,
  displayFloat,
  checkPoolToLock,
  getLock,
  getTime,
  lockTX,
  unLockTX
} from "@/helpers";
import DisplayToken from "@/components/DisplayToken.vue";
import GreenButton from "@/components/GreenButton.vue";
import BigInteger from "big-integer";
import ReloadSymbol from "@/components/ReloadButton.vue";
import Swal from "sweetalert2";
export default {
  name: "LockBoard",
  components: {ReloadSymbol, GreenButton, DisplayToken},
  props: ['nftArray', 'activeIndex', 'instance', "wallet", 'set', 'signTx'],
  methods:{
    async refresh(){
      this.isReady = false;
      this.nft = this.nftArray[this.activeIndex];
      this.time = displayTime(this.instance.unit_time);
      if(this.nft.stake){
        this.rewards = this.nft.stake.rewards;
        const realTime: BigInteger = await getTime();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const delta: BigInteger = BigInteger(this.nft.stake.end_time).subtract(realTime);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if(delta.greater(BigInteger("0"))){
          this.timeLeft = displayTime(delta);
        }
        else{
          this.timeLeft = undefined;
        }
        this.poolDrown = false;
        this.isLocked = true;
      }
      else{
        this.rewards = this.nft.rewards;
        this.poolDrown = !checkPoolToLock(this.rewards, this.instance);
        this.isLocked = false;
      }
      this.isReady = true;
    },
    async refreshTime(){
      const realTime: BigInteger = await getTime();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const delta: BigInteger = BigInteger(this.nft.stake.end_time).subtract(realTime);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      if(delta.greater(BigInteger("0"))){
        this.timeLeft = displayTime(delta);
      }
      else{
        this.timeLeft = undefined;
      }
    },
    async lock(){
      const lock = await getLock(new PublicKey(this.wallet), this.nft, this.instance);
      await Swal.fire({
        position: 'center',
        imageHeight: 300,
        icon: 'warning',
        iconColor: "#F3683D",
        text: "You won't be able to unlock your nft until the end of period: " + this.time,
        background: "#1E2424",
        color: "#F3683D",
        inputAttributes: {
          autocapitalize: 'off'
        },
        confirmButtonColor: "#2ED69B",
        cancelButtonColor: "#d96868",
        showCancelButton: true,
        confirmButtonText: 'Lock',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          const tx = await lockTX(new PublicKey(this.wallet), this.nft);
          if(! await this.signTx(tx)) return;
          this.nft.stake = lock;
          this.set(this.activeIndex, this.nft);
          await this.refresh();
        }
      });
    },
    async unLock(){
      const tx = await unLockTX(new PublicKey(this.wallet), this.nft, this.instance);
      if(! await this.signTx(tx)) return;
      this.nft.stake = undefined;
      this.set(this.activeIndex, this.nft);
      this.isLocked = true;
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
      isLocked: false,
      poolDrown: false,
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