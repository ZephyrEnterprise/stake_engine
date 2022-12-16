<template>
  <div class="con_inside rounded-4 pool_background">
    <div v-for="card in this.cards" :key="card">
      <NFTCard v-if="card.stake" :nft="card" :active-n-f-t="activeNFT" :choose="choose" :start-time="startTime"/>
    </div>
    <div v-for="card in this.cards" :key="card">
      <NFTCard v-if="!card.stake" :nft="card" :active-n-f-t="activeNFT" :choose="choose" :start-time="startTime"/>
    </div>
    <HollowCard v-if="!isReady"/>
  </div>
</template>

<script>
import NFTCard from "@/components/NFTCard";
import HollowCard from "@/components/HollowCard";
export default {
  name: "BottomPool",
  components: {HollowCard, NFTCard},
  props: ['cards', 'activeNFT', 'choose', 'startTime', 'isReady']
}
</script>

<style scoped>
.con_inside{
  display: flex;
  flex-flow: row wrap;
  block-size: fit-content;
  padding: 5px;
}
</style>