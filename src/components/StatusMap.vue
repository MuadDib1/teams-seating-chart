<template>
  <div class="status-map">
    <status-color-changer ref="statusColorchanger" @change="updateStatusColorMap"></status-color-changer>
    <v-stage ref="stage" :config="configKonva">
      <v-layer ref="layer" @dragmove="onDragmove" @dragend="onDragend">
        <person-block v-for="p in peopleBlocks" :key="p.key"
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
      people: createTestData(),
      // people: [],
      layout: window.mainAPI.getLayout(),
      statusColorMap: window.mainAPI.getStatusColorMap()
    };
  },
  mounted () {
    window.mainAPI.onPeopleScraped((event, people) => {
      console.log(people)
      this.people = people
    })
  },
  computed: {
    peopleBlocks() {
      const updatedPeople = this.people.map((person, index) => {
        const setting = this.getSetting(person)
        return {
          key: person.name + person.status,
          x: setting ? setting.x : 10,
          y: setting ? setting.y : 10 + index*20,
          name: person.name,
          email: person.email,
          status: person.status,
          statusColor: this.statusColorMap.get(person.status) || 'white',
        }
      })

      const unknownPeople = this.layout
        .map(this.convertToPerson)
        .filter(person => person.email)
        .filter(person => !updatedPeople.some(p => p.name === person.name))
        .map(person => {
          return {
            key: person.name,
            x: person.x,
            y: person.y,
            name: person.name,
            email: person.email,
            status: '状態不明',
            statusColor: 'white',
          }
        })

      console.log(unknownPeople)
      return updatedPeople
    }
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

    convertToPerson(setting) {
      if (setting.id.includes('|')) {
        const index = setting.id.indexOf('|')
        const email = setting.id.slice(0, index)
        const name = setting.id.slice(index+1)
        return {
          x: setting.x,
          y: setting.y,
          name,
          email,
          status: '状態不明'
        }
      } else {
        // v1.0.3以前
        return {
          x: setting.x,
          y: setting.y,
          name: setting.id,
          email: null,
          status: '状態不明'
        }
      }
    },

    getSetting(person) {
      return this.layout
        .map(this.convertToPerson)
        .find(p => p.name === person.name)
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
