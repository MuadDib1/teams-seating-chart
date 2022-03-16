<template>
  <div class="status-map">
    <v-stage ref="stage" :config="configKonva">
      <v-layer ref="layer" @dragmove="onDragmove" @dragend="onDragend">
        <person-block v-for="(person, index) in people" :key="person.name"
          :person="person"
          :x="10"
          :y="10 + index*60"
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
  data() {
    return {
      configKonva: {
        width: 1200,
        height: 800
      },
      people: [
        { name: 'Mishima Yoshinari (三島　吉就)', status: '連絡可能' },
        { name: 'Naotaka Nakanishi (中西　直孝)', status: '取り込み中' }
      ]
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.status-map {
  border-style: solid;
  border-width: 1px;
}
</style>
