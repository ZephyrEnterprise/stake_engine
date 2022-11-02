<template>
  <div class="con_inside rounded-4 pool_background">
    <div v-for="index in this.cards.length" :key="index">
      <NFTCard v-if="cards[index-1].stake" :nft="cards[index-1]" :self-index="index-1" :active-index="activeIndex" :choose="choose" :start-time="startTime"/>
    </div>
    <div v-for="index in this.cards.length" :key="index">
      <NFTCard v-if="!cards[index-1].stake" :nft="cards[index-1]" :self-index="index-1" :active-index="activeIndex" :choose="choose" :start-time="startTime"/>
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
  props: ['cards', 'activeIndex', 'choose', 'startTime', 'isReady']
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