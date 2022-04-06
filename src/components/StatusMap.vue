<template>
  <div class="status-map">
    <v-stage ref="stage" :config="configKonva">
      <v-layer ref="layer" @dragmove="onDragmove" @dragend="onDragend">
        <person-block v-for="(person, index) in people" :key="person.name + person.status"
          :person="person"
          :defaultX="10"
          :defaultY="10 + index*20"
          :setting="getSetting(person)"
        ></person-block>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import * as KonvaUtils from '../utils/konva-utils.js'
import PersonBlock from './PersonBlock.vue'

export default {
  components: {
    PersonBlock
  },
  props: {
    people: Array
  },
  data() {
    return {
      configKonva: {
        width: 1800,
        height: 900
      },
      layout: window.mainAPI.getLayout()
    };
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
      this.layout = layer.find('Group').map(this.getSerilizedData)
      window.mainAPI.saveLayout(this.layout)
    },

    getSerilizedData(group) {
      return {
        x: group.x(),
        y: group.y(),
        id: group.id(),
      }
    },

    getSetting(person) {
      return this.layout.find(p => p.id === person.name)
    }
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
