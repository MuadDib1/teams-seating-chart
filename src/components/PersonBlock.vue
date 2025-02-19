<template>
  <v-group :config="configGroup"
    @mouseover="showChatIcon"
    @mouseout="hideChatIcon"
  >
    <v-rect :config="configRect"></v-rect>
    <v-text :config="configText"></v-text>
    <v-circle :config="configCircle"
      @mouseover="showTooltip"
      @mouseout="hideTooltip"
      @click="changeColor"
    ></v-circle>
    <v-label :config="configStatusTooltip">
      <v-tag :config="configStatusTag"></v-tag>
      <v-text :config="configStatusText"></v-text>
    </v-label>
    <v-image v-if="email" :config="configChat" @click="openChat"></v-image>
  </v-group>
</template>

<script>
import chaticon from '../assets/chat-processing.png'
import { SNAPPING_LABEL } from '../utils/konva-utils.js'

const BLOCK_WIDTH = 100
const BLOCK_HEIGHT = 50
const PADDING = 6
const STATUS_RADIUS = 6
const FONT_FAMILY = 'Arial,BIZ UDPGothic'
// https://saruwakakun.com/design/gallery/palette
const COLOR = {
  base: '#78BBE6',
  light: '#D5EEFF',
  dark: '#1B435D',
  accent: '#F99F48',
}

export default {
  props: {
    x: Number,
    y: Number,
    name: String,
    email: String,
    status: String,
    statusColorMap: Map
  },
  data() {
    return {
      configRect: {
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        fill: COLOR.light,
        stroke: COLOR.dark,
        strokeWidth: 1
      },
      configStatusTooltip: {
        x: 5,
        y: 5,
        visible: false,
      },
      configStatusTag: {
        fill: 'white',
      },
      configChat: {
        x: BLOCK_WIDTH - 25,
        y: BLOCK_HEIGHT - 25,
        image: null,
        visible: false
      }
    };
  },
  created() {
    const image = new window.Image()
    image.src = chaticon
    image.onload = () => {
      this.configChat.image = image
    }
  },
  computed: {
    configGroup() {
      return { 
        x: this.x,
        y: this.y,
        draggable: true,
        name: SNAPPING_LABEL,
        id: `${this.email}|${this.name}`
      }
    },
    configText() {
      return {
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        padding: PADDING,
        verticalAlign: 'middle',
        fontFamily: FONT_FAMILY,
        text: this.name
      }
    },
    configCircle() {
      return {
        x: BLOCK_WIDTH - STATUS_RADIUS - PADDING,
        y: STATUS_RADIUS + PADDING,
        radius: STATUS_RADIUS,
        fill: this.statusColorMap.get(this.status) || 'white',
        strokeWidth: 4
      }
    },
    configStatusText() {
      return {
        text: this.status,
        padding: 5,
        fill: COLOR.dark,
        fontFamily: FONT_FAMILY,
      }
    },
  },
  methods: {
    changeColor() {
      this.$emit('changeColor', {
        status: this.status,
        color: this.configCircle.fill
      })
    },
    showTooltip() {
      this.configStatusTooltip.visible = true
    },
    hideTooltip() {
      this.configStatusTooltip.visible = false
    },
    showChatIcon() {
      this.configChat.visible = true
    },
    hideChatIcon() {
      this.configChat.visible = false
    },
    openChat () {
      window.mainAPI.openChat(this.email)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
