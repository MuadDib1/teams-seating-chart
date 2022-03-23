<template>
  <v-group :config="configGroup" @dblclick="edit">
    <v-rect :config="configRect"></v-rect>
    <v-text :config="configText"></v-text>
    <v-circle :config="configCircle" @mouseover="showTooltip" @mouseout="hideTooltip"></v-circle>
    <v-label :config="configStatusTooltip">
      <v-tag :config="configStatusTag"></v-tag>
      <v-text :config="configStatusText"></v-text>
    </v-label>
  </v-group>
</template>

<script>
const initialWidth = 100
const initialHeight = 50
const padding = 6
const radius = 6

export default {
  props: {
    person: Object,
    defaultX: Number,
    defaultY: Number,
    setting: Object
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
      configCircle: {
        x: initialWidth - radius - padding,
        y: radius + padding,
        radius: radius,
        fill: this.getColor(this.person.status),
        strokeWidth: 4
      },
      configStatusTooltip: {
        x: 5,
        y: 5,
        visible: false,
      },
      configStatusTag: {
        fill: '#EB8686',
      },
      configStatusText: {
        text: this.person.status,
        padding: 5,
        fill: 'white',
      }
    };
  },
  methods: {
    edit() {
      const name = window.prompt('表示名を変更できます', this.configText.text)
      if (name) {
        this.configText.text = name
      }
    },
    getColor(status) {
      const green = '#92c353'
      const red = '#c4314b'
      const orange = '#fcb80e'
      const gray = '#dcdcdc'
      const white = '#ffffff'
      const colorMap = new Map([
        ['連絡可能', green],
        ['取り込み中', red],
        ['応答不可', red],
        ['通話中', red],
        ['発表中', red],
        ['一時退席中', orange],
        ['退席中', orange],
        ['オフライン', gray],
      ])
      const otherColor = white
      return colorMap.has(status) ? colorMap.get(status) : otherColor
    },
    showTooltip() {
      this.configStatusTooltip.visible = true
    },
    hideTooltip() {
      this.configStatusTooltip.visible = false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
