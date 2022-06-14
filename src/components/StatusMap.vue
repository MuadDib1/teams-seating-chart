<template>
  <div class="status-map">
    <status-color-changer ref="statusColorchanger" @change="updateStatusColorMap"></status-color-changer>

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
          @changeColor="showStatusColorChanger"
        ></person-block>

        <editable-text v-for="label in customLables" :key="label.id"
          v-bind="label"
          :stage="getStage()"
          @change="save"
        ></editable-text>

        <v-transformer ref="transformer" :config="configTransformer"></v-transformer>
        <v-rect ref="selectionRect" :config="configSelectionRect"></v-rect>
      </v-layer>
    </v-stage>

    <context-menu ref="menu" :stage="getStage()" @addlabelClicked="addLabel"></context-menu>
  </div>
</template>

<script>
import KonvaRectRegionCalculator from '../utils/konva-rect-region-calculator.js'
import * as KonvaUtils from '../utils/konva-utils.js'
import Konva from 'konva'
import PersonBlock from './PersonBlock.vue'
import ContextMenu from './ContextMenu.vue'
import EditableText from './EditableText.vue'
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

const CUSTOM_LABEL_PREFIX = 'customLabel:'

Konva.pixelRatio = 2

export default {
  components: {
    PersonBlock,
    ContextMenu,
    EditableText,
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
      customLables: window.mainAPI.getCustomLabels(),
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
  methods: {
    getStage() {
      return this.$refs.stage ? this.$refs.stage.getNode() : null
    },
    getLayer() {
      return this.$refs.layer.getNode()
    },
    getTransformer() {
      return this.$refs.transformer.getNode()
    },

    save() {
      // レイアウトを保存
      this.layout = this.getLayer().find('Group')
        .filter(group => group.id()) // Group を継承している Label を除外
        .filter(group => !group.id().startsWith(CUSTOM_LABEL_PREFIX)) // カスタムラベルを除外
        .map(this.toSerilizedLayout)
      window.mainAPI.saveLayout(this.layout)

      // カスタムラベルを保存
      const labels = this.getLayer().find('Group')
        .filter(group => group.id() && group.id().startsWith(CUSTOM_LABEL_PREFIX))
        .map(this.toSerilizedLabel)
        .filter(label => label.text) // 空ラベルは除外
      window.mainAPI.saveCustomLabels(labels)
    },

    toSerilizedLayout(group) {
      return {
        x: group.x(),
        y: group.y(),
        id: group.id(),
      }
    },

    toSerilizedLabel(group) {
      const index = group.id().indexOf('|');
      return {
        x: group.x(),
        y: group.y(),
        id: group.id().slice(0, index),
        text: group.id().slice(index+1),
      }
    },

    showStatusColorChanger(data) {
      this.$refs.statusColorchanger.open(data.status, data.color)
    },

    updateStatusColorMap() {
      this.statusColorMap = window.mainAPI.getStatusColorMap()
    },

    showContextMenu() {
      this.$refs.menu.show();
    },

    hideContextMenu() {
      if (this.$refs.menu) {
        this.$refs.menu.hide(); 
      }
    },

    addLabel() {
      this.customLables.push({
        id: CUSTOM_LABEL_PREFIX + new Date().getTime(),
        text: '新しいラベル',
        x: this.getStage().getPointerPosition().x,
        y: this.getStage().getPointerPosition().y,
      });
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
      this.save();
    },

    onStageClick(e) {
      this.updateClickSelection(e.evt, e.target);
      this.hideContextMenu();
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
      this.showContextMenu();
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
