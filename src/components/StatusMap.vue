<template>
  <div class="status-map">
    <status-color-changer ref="statusColorchanger" @change="updateStatusColorMap"></status-color-changer>
    <v-stage ref="stage" :config="configKonva">
      <v-layer ref="layer" @dragmove="onDragmove" @dragend="onDragend">
        <person-block v-for="p in peopleBlocks" :key="p.name"
          v-bind="p"
          :statusColorMap="statusColorMap"
          @changeColor="statusColorChange"
        ></person-block>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import * as KonvaUtils from '../utils/konva-utils.js'
import Konva from 'konva'
import PersonBlock from './PersonBlock.vue'
import StatusColorChanger from './StatusColorChanger.vue'

const PersonBlockService = require('../utils/person-block-service.js')

const createTestData = () => {
  const result = []
  for (let i = 0; i < 30; i++) {
    result.push({ name: 'Shingen Takeda (武田　信玄)' + i, status: '連絡可能' })
  }
  result.push({ name: 'Kenshin Uesugi (上杉　謙信)', status: '取り込み中' })
  return result
}

Konva.pixelRatio = 2

export default {
  components: {
    PersonBlock,
    StatusColorChanger
  },
  data() {
    return {
      configKonva: {
        width: 1800,
        height: 900
      },
      peopleBlocks: PersonBlockService.from(window.mainAPI.getLayout()),
      layout: window.mainAPI.getLayout(),
      statusColorMap: window.mainAPI.getStatusColorMap()
    };
  },
  mounted () {
    window.mainAPI.onPeopleScraped((event, people) => {
      console.log(people)
      this.peopleBlocks = PersonBlockService.merge(this.peopleBlocks, people)
    })
    // this.peopleBlocks = PersonBlockService.merge(this.peopleBlocks, createTestData())
  },
  methods: {
    onDragmove(e) {
      const stage = this.$refs.stage.getNode()
      const layer = this.$refs.layer.getNode()

      layer.find('.guid-line').forEach((l) => l.destroy());

      const lineGuideStops = KonvaUtils.getLineGuideStops(stage, e.target);
      const itemBounds = KonvaUtils.getObjectSnappingEdges(e.target);
      const guides = KonvaUtils.getGuides(lineGuideStops, itemBounds);
      if (!guides.length) {
        return;
      }

      KonvaUtils.drawGuides(layer, guides);

      const absPos = KonvaUtils.getAdjustedAbsPos(e.target.absolutePosition(), guides);
      e.target.absolutePosition(absPos);
    },

    onDragend(e) {
      const layer = this.$refs.layer.getNode()

      layer.find('.guid-line').forEach((l) => l.destroy());

      // レイアウトを保存
      this.layout = layer.find('Group')
        .filter(group => group.id()) // Group を継承している Label を除外
        .map(this.getSerilizedData)
      window.mainAPI.saveLayout(this.layout)
    },

    getSerilizedData(group) {
      return {
        x: group.x(),
        y: group.y(),
        id: group.id(),
      }
    },

    statusColorChange(data) {
      this.$refs.statusColorchanger.open(data.status, data.color)
    },

    updateStatusColorMap() {
      this.statusColorMap = window.mainAPI.getStatusColorMap()
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.status-map >>> canvas {
  border-style: solid !important;
  border-width: 1px !important;
}
</style>
