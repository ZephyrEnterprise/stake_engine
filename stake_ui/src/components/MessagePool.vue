<template>
    <div class="container1 container rounded-4" style="margin-bottom: 0px">
      <div v-if="isSpinning" class="spinner-border white_letter" role="status" style="justify-self: center; justify-content: space-between; margin-bottom: 10px"/>
      <h5 v-else class="row_msg rounded-2 white_letter">
        {{title}}
      </h5>
      <a class="row_msg rounded-2 grey_letter" :href="refToCollection" target="_blank" style="text-decoration: none">
        {{text}}
      </a>
    </div>
</template>

<script>
import {RefToMagicEden} from "@/custom";
export default {
  name: "MessagePool",
  props: ['title', 'text', 'isSpinning'],
  data(){
    return{
      refToCollection: RefToMagicEden,
    }
  }
}
</script>

<style scoped>
.row_msg{
  display: grid;
  grid-auto-flow: column;
  padding: 0;
  margin-top: 0;
  margin-bottom: 3px;
  margin-left: 5px;
  margin-right: 5px;
  justify-content: space-between;
  justify-self: center;
}
</style>