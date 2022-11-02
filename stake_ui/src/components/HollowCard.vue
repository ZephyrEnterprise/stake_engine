<template>
  <button class="button rounded-3 border-2 nft_hlw hollow" :disabled="true">
    <div   class="spinner-border roll" role="status"/>
    <div class="card nft_background">
      <img src="@/assets/HollowNFTCard.png" style="top: 0; margin: 0px;"
           class="rounded-3 card-img-top">
      <div class="card-body" style="padding: 0; margin: 0;">
        <div style="text-align: start; margin-left: 10px;">
          <div class="rounded-3" style="background-color: #d0d0d0; color: #d0d0d0; width: 100px; margin: 5px; height: 15px;"/>
          <div class="rounded-3" style="background-color: #d0d0d0; color: #d0d0d0; width: 50px; margin: 6px; height: 15px;"/>
        </div>
      </div>
    </div>
  </button>
</template>

<script>
export default {
  name: "HollowCard",
  data(){
    return{

    }
  },
}
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
  color: #000000;
  z-index: 1;
}
.hollow {
  animation: fadeInAnimation ease 2.5s;
  animation-iteration-count: 200;
  animation-fill-mode: forwards;
}
@keyframes fadeInAnimation {
  0% {
    opacity: 0.1;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.1;
  }
}
</style>