<template>
    <span v-if="!exec" class="name_hover reload"
          style="font-size:20px; margin-right: 5px; margin-left: auto;"
          v-on:click="this.click()">&#8634;</span>
  <div v-else class="spinner-border roll_color reload" role="status"></div>
</template>

<script>
export default {
  name: "ReloadSymbol",
  props: ['func'],
  methods: {
    async click(){
      this.exec = true;
      await this.func();
      this.exec = false;
    }
  },
  data(){
    return{
      exec: false
    }
  }
}
</script>

<style>
.reload{
  justify-self: end;
  width: 20px;
  height: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
  margin-right: 2px;
  font-size: 10px;
}
</style>