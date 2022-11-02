<template>
  <a v-bind:href="prefix+token+postfix" class="btn symbol_hover" style="background-color: transparent; border-color: transparent;">
    {{value}}
  </a>
</template>

<script>
import {env} from "@/helpers";
export default {
  name: "DisplayToken",
  props: ["value", 'token'],
  data(){
    return{
      prefix: env.explorerAddressPrefix,
      postfix: env.explorerAddressPostfix
    }
  }
}
</script>
