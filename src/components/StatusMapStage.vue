<template>
  <div class="status-map">
    <v-stage ref="stage" :config="configKonva"
      @click="onStageClick"
      @contextmenu="onStageContextMenu"
      @mousedown="onStageMousedown"
      @mousemove="onStageMousemove"
      @mouseup="onStageMouseup"
    >
      <v-layer ref="layer" @dragmove="onLayerDragmove" @dragend="onLayerDragend">
        <person-block v-for="p in peopleBlocks" :key="p.name"
          v-bind="p"
          :statusColorMap="statusColorMap"
          @changeColor="$emit('changeColor', $event)"
        ></person-block>

        <editable-text v-for="label in customLables" :key="label.id"
          v-bind="label"
          @change="$emit('change')"
        ></editable-text>

        <v-transformer ref="transformer" :config="configTransformer"></v-transformer>
        <v-rect ref="selectionRect" :config="configSelectionRect"></v-rect>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import Konva from 'konva'
import KonvaRectRegionCalculator from '../utils/konva-rect-region-calculator.js'
import * as KonvaUtils from '../utils/konva-utils.js'
import EditableText from './EditableText.vue'
import PersonBlock from './PersonBlock.vue'

Konva.pixelRatio = 2

export default {
  components: {
    PersonBlock,
    EditableText,
  },
  props: {
    customLables: Array,
    peopleBlocks: Array,
    layout: Array,
    statusColorMap: Map
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
    }
  },
  methods: {
    getStage() {
      return this.$refs.stage.getNode()
    },
    getLayer() {
      return this.$refs.layer.getNode()
    },
    getTransformer() {
      return this.$refs.transformer.getNode()
    },

    drawGuidesAndAdjustPosition(target) {
      KonvaUtils.drawGuidesAndAdjustPosition(this.getStage(), this.getLayer(), target);
    },

    clearGuides() {
      KonvaUtils.clearGuides(this.getLayer());
    },

    updateClickSelection(mouseEvent, target) {
      const metaPressed = mouseEvent.shiftKey || mouseEvent.ctrlKey || mouseEvent.metaKey;
      KonvaUtils.updateTransformerNodes(this.getStage(), this.getTransformer(), target, metaPressed);
    },

    startDragSelection() {
      this.rectRegionCalculator.start(this.getStage().getPointerPosition());
      this.configSelectionRect = {
        ...this.configSelectionRect,
        visible: true,
        width: 0,
        height: 0,
      }
    },

    updateDragSelection() {
      const rect = this.rectRegionCalculator.getRect(this.getStage().getPointerPosition());
      this.configSelectionRect = {
        ...this.configSelectionRect,
        ...rect
      }
    },

    finishDragSelection() {
      // update visibility in timeout, so we can check it in click event
      setTimeout(() => {
        this.configSelectionRect.visible = false;
      });

      const box = this.$refs.selectionRect.getNode().getClientRect();
      const shapes = this.getStage().find('Group');
      const selected = shapes.filter((shape) =>
        Konva.Util.haveIntersection(box, shape.getClientRect())
      );
      this.getTransformer().nodes(selected);
    },

    isDragSelecting() {
      return this.configSelectionRect.visible
    },
    
    onLayerDragmove(e) {
      if (e.target.attrs.name !== KonvaUtils.SNAPPING_LABEL) {
        return
      }
      this.clearGuides();
      this.drawGuidesAndAdjustPosition(e.target);
    },

    onLayerDragend(e) {
      this.clearGuides();
      this.$emit('change');
    },

    onStageClick(e) {
      this.updateClickSelection(e.evt, e.target);
      this.$emit('hideContextMenu');
    },

    onStageMousedown(e) {
      if (e.target !== this.getStage()) {
        return;
      }
      e.evt.preventDefault();
      this.startDragSelection();
    },

    onStageMousemove(e) {
      if (!this.isDragSelecting()) {
        return;
      }
      e.evt.preventDefault();
      this.updateDragSelection();
    },

    onStageMouseup(e) {
      if (!this.isDragSelecting()) {
        return;
      }
      e.evt.preventDefault();
      this.finishDragSelection();
    },

    onStageContextMenu(e) {
      if (e.target !== this.getStage()) {
        return;
      }
      this.$emit('showContextMenu');
    }
  }
}
</script>

<style scoped>
.status-map >>> canvas {
  border-style: solid !important;
  border-width: 1px !important;
}
</style>