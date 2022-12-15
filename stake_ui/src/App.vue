<template>
  <NavBar/>
  <MessagePool v-if="!this.wallet" title="Connect wallet" class="nav_background"/>
  <MessagePool v-else-if="this.nftArray.length === 0 && isReady" title="No NFTs found to Stake" text="Get from MagicEden" class="nav_background"/>
  <div class="container_grid" v-if="this.wallet&&!(isReady&&nftArray.length===0)" style="display: flex; overflow: hidden">
    <BottomPool :cards="this.nftArray" :active-index="activeNFTIndex" :is-ready="isReady"
                :choose="chooseNFT" :class="(activeNFTIndex>=0)? 'container_grid_cut': ''" :start-time="start_time"/>
    <LockBoard v-if="(activeNFTIndex>=0)&&(this.instance.spec===1)" :active-index="activeNFTIndex" :nft-array="nftArray" :set="setNFT"
                 :instance="this.instance" :wallet="this.wallet.publicKey.toBase58()" :sign-tx="signTx"/>
    <StakeBoard v-if="(activeNFTIndex>=0)&&(this.instance.spec===0)" :active-index="activeNFTIndex" :nft-array="nftArray" :set="setNFT"
                 :instance="this.instance" :wallet="this.wallet.publicKey.toBase58()" :sign-tx="signTx"/>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {PublicKey} from "@solana/web3.js";
import NavBar from "@/components/NavBar.vue";
import Swal from "sweetalert2";
import {useAnchorWallet} from 'solana-wallets-vue';
import {reactive} from "vue";
import { Provider} from '@project-serum/anchor';
import { computed } from 'vue';
import {useLocalStorage} from '@vueuse/core';
import {env, Instance, NFT, parseInstance, searchForNFTS, getLocalTime} from "./helpers";
import BottomPool from "@/components/BottomPool.vue";
import LockBoard from "@/components/LockBoard.vue";
import StakeBoard from "@/components/StakeBoard.vue";
import MessagePool from "@/components/MessagePool.vue";
export default defineComponent({
  name: 'App',
  components: {
    MessagePool,
    BottomPool,
    LockBoard,
    StakeBoard,
    NavBar
  },
  methods:{
    async refresh(){
      //console.log("Refresh", this.localWallet);
      if(this.localWallet!==""){
        this.isReady = false;
        await searchForNFTS(new PublicKey(this.localWallet), this.nftArray, this.instance.spec);
        this.isReady = true;
      }
    },
    chooseNFT(index: number){
      this.activeNFTIndex = index;
    },
    setNFT(index: number, nft: NFT){
      this.nftArray[index] = nft;
    }
  },
  async mounted() {
    this.instance = await parseInstance(new PublicKey(env.config.instance));
    //console.log(this.instance)
    this.refresh();
  },
  watch: {
    wallet: {
      deep: true,
      async handler(newVal) {
        if(this.localWallet!=""){
          if(newVal.publicKey.toBase58()!=this.localWallet){
            //console.log("New", newVal.publicKey.toBase58());
            this.localWallet = newVal.publicKey.toBase58();
            this.nftArray = [];
            window.location.reload();
          }
        }
        else{
          if(newVal){
            //console.log("Set", newVal.publicKey.toBase58());
            this.localWallet = newVal.publicKey.toBase58();
            this.refresh();
          }
        }
      }
    }
  },
  data(){
    return{
      instance: undefined as Instance,
      nftArray: useLocalStorage("nftArray", [] as NFT[]),
      activeNFTIndex: -1 as number,
      localWallet: useLocalStorage("localWallet", ""),
      isReady: false,
      start_time: getLocalTime(),
    }
  },
  setup() {
    const preflightCommitment = 'processed'
    const commitment = 'confirmed'
    const wallet = reactive(useAnchorWallet());
    const provider = computed(() => new Provider(env.connection, wallet.value, {preflightCommitment, commitment}));
    env.setProvider(provider);
    const showError = (text) => {
      Swal.fire({
        position: 'top',
        imageHeight: 500,
        icon: 'error',
        title: text,
        showConfirmButton: false,
        timer: 1000,
        background: "#1E2424",
        color: "#FFFDFD",
        iconColor: "#f18181"
      });
    }
    const showSuccess = (text) => {
      Swal.fire({
        position: 'top',
        imageHeight: 500,
        icon: 'success',
        title: text,
        showConfirmButton: false,
        timer: 1000,
        background: "#1E2424",
        color: "#FFFDFD",
        iconColor: "#2ED69B"
      });
    }
    const signTx = async (tx) => {
      try {
        const tXH = await provider.value.send(tx, [], {preflightCommitment: 'processed', commitment: 'confirmed'});
        console.log(tXH)
        showSuccess("Transaction succeed");
        return true;
      } catch (e) {
        console.log(e);
        showError("Transaction failed");
        return false
      }
    }
    return {
      wallet,
      provider,
      signTx,
    }
  }
})
</script>

<style>
@import './styles.css';
@import './colors.css';

</style>
