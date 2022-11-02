<template>
  <button v-if="(!exec)&&isShort" type="button" class="success_button btn white_hover" v-on:click="this.click()"
          :disabled="this.disabled" style="width: 90px;">
    {{ text }}
  </button>
  <button v-else-if="!exec" type="button" class="success_button btn white_hover" v-on:click="this.click()"
          :disabled="this.disabled" style="width: 150px;">
    {{ text }}
  </button>
  <div v-else class="spinner-border roll_color roll" role="status"/>
</template>

<script>
export default {
  name: "GreenButton",
  props: ['onClick', 'text', 'color', 'disabled', 'isShort'],
  methods: {
    async click(){
      this.exec = true;
      await this.onClick();
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

<style scoped>
.btn{
  margin-top: 0px;
  margin-bottom: 0px;
  justify-self: center;
  border-color: transparent;
}
.roll{
  justify-self: center;
  width: 38px;
  height: 38px;
  margin-top: 0;
  margin-bottom: 0;
  margin-right: 37px;
  margin-left: 37px;
}
</style>