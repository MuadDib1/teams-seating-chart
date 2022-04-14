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
    <v-image :config="configChat" @click="openChat"></v-image>
  </v-group>
</template>

<script>
import chaticon from '../assets/chat-processing.png'

const initialWidth = 100
const initialHeight = 50
const padding = 6
const radius = 6

export default {
  props: {
    person: Object,
    defaultX: Number,
    defaultY: Number,
    setting: Object,
    statusColorMap: Map
  },
  data() {
    return {
      configGroup: {
        x: this.setting ? this.setting.x : this.defaultX,
        y: this.setting ? this.setting.y : this.defaultY,
        draggable: true,
        name: 'snapping-object',
        id: this.person.name
      },
      configRect: {
        width: initialWidth,
        height: initialHeight,
        // https://saruwakakun.com/design/gallery/palette
        fill: '#D5EEFF',
        stroke: '#1B435D',
        strokeWidth: 1
      },
      configText: {
        width: initialWidth,
        height: initialHeight,
        padding: padding,
        verticalAlign: 'middle',
        text: this.person.name
      },
      configStatusTooltip: {
        x: 5,
        y: 5,
        visible: false,
      },
      configStatusTag: {
        fill: '#1B435D',
      },
      configStatusText: {
        text: this.person.status,
        padding: 5,
        fill: 'white',
      },
      configChat: {
        x: initialWidth - 25,
        y: initialHeight - 25,
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
    configCircle() {
      return {
        x: initialWidth - radius - padding,
        y: radius + padding,
        radius: radius,
        fill: this.statusColorMap.get(this.person.status) || 'white',
        strokeWidth: 4
      }
    },
  },
  methods: {
    changeColor() {
      this.$emit('changeColor', {
        status: this.person.status,
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
      window.mainAPI.openChat(this.person.email)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
