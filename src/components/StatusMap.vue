<template>
  <div class="status-map">
    <status-color-changer ref="statusColorchanger" @change="updateStatusColorMap"></status-color-changer>
    <v-stage ref="stage" :config="configKonva"
      @click="onStageClick"
      @mousedown="onStageMousedown"
      @mousemove="onStageMousemove"
      @mouseup="onStageMouseup"
    >
      <v-layer ref="layer" @dragmove="onDragmove" @dragend="onDragend">
        <person-block v-for="p in peopleBlocks" :key="p.name"
          v-bind="p"
          :statusColorMap="statusColorMap"
          @changeColor="statusColorChange"
        ></person-block>
        <v-transformer ref="transformer" :config="configTransformer"></v-transformer>
        <v-rect ref="selectionRect" :config="configSelectionRect"></v-rect>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import KonvaRectRegionCalculator from '../utils/konva-rect-region-calculator.js'
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
      configTransformer: {
        resizeEnabled: false,
        rotateEnabled: false,
      },
      configSelectionRect: {
        fill: 'rgba(0,0,255,0.5)',
        visible: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      rectRegionCalculator: new KonvaRectRegionCalculator(),
      peopleBlocks: PersonBlockService.from(window.mainAPI.getLayout()),
      layout: window.mainAPI.getLayout(),
      statusColorMap: window.mainAPI.getStatusColorMap()
    };
  },
  mounted () {
    // this.peopleBlocks = PersonBlockService.merge(this.peopleBlocks, createTestData())

    window.mainAPI.onPeopleScraped((event, people) => {
      console.log(people)
      this.peopleBlocks = PersonBlockService.merge(this.peopleBlocks, people)
      this.$nextTick(this.save)
    })
  },
  computed: {
    stage: function () {
      return this.$refs.stage.getNode()
    },
    layer: function () {
      return this.$refs.layer.getNode()
    },
    transformer: function () {
      return this.$refs.transformer.getNode()
    },    
  },
  methods: {
    onDragmove(e) {
      this.layer.find('.guid-line').forEach((l) => l.destroy());

      const lineGuideStops = KonvaUtils.getLineGuideStops(this.stage, e.target);
      const itemBounds = KonvaUtils.getObjectSnappingEdges(e.target);
      const guides = KonvaUtils.getGuides(lineGuideStops, itemBounds);
      if (!guides.length) {
        return;
      }

      KonvaUtils.drawGuides(this.layer, guides);

      const absPos = KonvaUtils.getAdjustedAbsPos(e.target.absolutePosition(), guides);
      e.target.absolutePosition(absPos);
    },

    onDragend(e) {
      this.save()
    },

    save() {
      this.layer.find('.guid-line').forEach((l) => l.destroy());

      // レイアウトを保存
      this.layout = this.layer.find('Group')
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

    onStageClick(e) {
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      KonvaUtils.updateTransformerNodes(this.stage, this.transformer, e.target, metaPressed);
    },

    onStageMousedown(e) {
      // do nothing if we mousedown on any shape
      if (e.target !== this.stage) {
        return;
      }
      e.evt.preventDefault();

      this.rectRegionCalculator.start(this.stage.getPointerPosition());
      this.configSelectionRect = {
        ...this.configSelectionRect,
        visible: true,
        width: 0,
        height: 0,
      }
    },

    onStageMousemove(e) {
      if (!this.configSelectionRect.visible) {
        return;
      }
      e.evt.preventDefault();

      const rect = this.rectRegionCalculator.getRect(this.stage.getPointerPosition());
      this.configSelectionRect = {
        ...this.configSelectionRect,
        ...rect
      }
    },

    onStageMouseup(e) {
      if (!this.configSelectionRect.visible) {
        return;
      }
      e.evt.preventDefault();
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        this.configSelectionRect.visible = false;
      });

      const box = this.$refs.selectionRect.getNode().getClientRect();
      const shapes = this.stage.find('Group');
      const selected = shapes.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );
      this.transformer.nodes(selected);
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
