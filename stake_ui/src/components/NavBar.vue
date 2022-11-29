<template>
  <div class="navbar-expand nav_background">
    <div class="container_grid">
      <div class="navbar">
        <div class="nav-item">
          <img src="@/assets/OfficialLogo.png"
               class="rounded-circle logo"/>
          <div class="nav-item centered">
            <a class="collection text-decoration-none h4" v-bind:href='refToCollection' target="_blank">
              {{ collectionName }}
            </a>
            <br/>
            <a class="s text-decoration-none">
              Stake your NFTs
            </a>
          </div>
        </div>

        <div class="navbar">
          <div class="nav-item nav-social">
            <a :href="refToDiscord" style="text-decoration: none;" target="_blank" v-if="refToDiscord">
              <img src="@/assets/discord_logo.png" class="social"/>
            </a>
            <a :href="refToTwitter" style="text-decoration: none;" target="_blank" v-if="refToTwitter">
              <img src="@/assets/twitter_logo.png" class="social"/>
            </a>
          </div>
          <wallet-multi-button dark></wallet-multi-button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { WalletMultiButton } from 'solana-wallets-vue'
import {OfficialDiscord, OfficialName, OfficialTwitter, RefToMagicEden} from "@/custom";
export default {
  name: "NavBar",
  data(){
    return{
      collectionName: OfficialName,
      refToCollection: RefToMagicEden,
      refToTwitter: OfficialTwitter,
      refToDiscord: OfficialDiscord
    }
  },
  components: {
    WalletMultiButton
  },
}
</script>

<style>
#app .swv-button-trigger p {
  margin-top: 15px;
}
</style>

<style scoped>
.navbar-expand{
  margin-bottom: 20px;
}
.navbar{
  padding-top: 25px;
  padding-bottom: 25px;
}
.logo{
  height: 125px;
  width: 125px;
}
.collection{
  color: #FFFDFD;
  margin-left: 15px;
}
.s{
  color: #B7B7B7;
  position: absolute;
  margin-top: 5px;
  margin-left: 5px;
}
.nav-item{
  display: inline-block;
}
.centered{
  align-items: center;
}
.nav-social{
  justify-self: end;
  margin-right: 25px;
}
.social{
  height: 60px;
  width: 60px;
  margin: 0 10px 0 10px;
  filter: brightness(0.70);
}
</style>