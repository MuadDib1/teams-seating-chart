<template>
  <v-group :config="configGroup" @dblclick="edit">
    <v-rect :config="configRect"></v-rect>
    <v-circle :config="configCircle"></v-circle>
    <v-text :config="configText"></v-text>
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
    x: Number,
    y: Number
  },
  data() {
    return {
      configGroup: {
        x: this.x,
        y: this.y,
        draggable: true,
        name: 'snapping-object'
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
      const colorMap = new Map([
        ['連絡可能', '#92c353'],
        ['取り込み中', '#c4314b'],
        ['応答不可', '#c4314b'],
        ['一時退席中', '#fcb80e'],
        ['退席中表示', '#fcb80e'],
        ['オフライン', '#ffffff'],
      ])
      const otherColor = '#dcdcdc'
      return colorMap.has(status) ? colorMap.get(status) : otherColor
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
