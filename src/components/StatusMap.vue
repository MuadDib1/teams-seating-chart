<template>
  <div>
    <status-color-changer ref="statusColorchanger" @change="updateStatusColorMap"></status-color-changer>
    <status-map-stage ref="statusMapStage"
      :customLables="customLables"
      :layout="layout"
      :peopleBlocks="peopleBlocks"
      :statusColorMap="statusColorMap"
      @change="save"
      @changeColor="showStatusColorChanger"
      @showContextMenu="showContextMenu"
      @hideContextMenu="hideContextMenu"
    ></status-map-stage>
    <context-menu ref="menu" @addlabelClicked="addLabel"></context-menu>
  </div>
</template>

<script>
import ContextMenu from './ContextMenu.vue'
import StatusColorChanger from './StatusColorChanger.vue'
import StatusMapStage from './StatusMapStage.vue'

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

export default {
  components: {
    ContextMenu,
    StatusColorChanger,
    StatusMapStage
  },
  data() {
    return {
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
      return this.$refs.statusMapStage.getStage()
    },
    getLayer() {
      return this.$refs.statusMapStage.getLayer()
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
      this.$refs.menu.show(this.getStage());
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
  }
}
</script>

<style scoped>
</style>
