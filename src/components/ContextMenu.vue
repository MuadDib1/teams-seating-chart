<template>
  <div id="menu" ref="menu">
    <div>
      <button @click="onAddLabelClicked">ラベルを追加</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    show (stage) {
      const menu = this.$refs.menu;
      const containerRect = stage.container().getBoundingClientRect();
      const pointerPosition = stage.getPointerPosition();

      menu.style.top = containerRect.top + pointerPosition.y + 4 + 'px';
      menu.style.left = containerRect.left + pointerPosition.x + 4 + 'px';
      menu.style.display = 'initial';
    },
    hide () {
      const menu = this.$refs.menu;
      menu.style.display = 'none';
    },
    onAddLabelClicked () {
      this.$emit('addlabelClicked');
      this.hide();
    }
  }
}
</script>

<style>
#menu {
  display: none;
  position: absolute;
  width: 200px;
  background-color: white;
  border: solid;
  border-width: 1px;
  border-color: #ccc;
  box-shadow: 2px 2px 5px grey;
}

#menu button {
  width: 100%;
  background-color: white;
  border: none;
  margin: 0;
  padding: 10px;
  padding-left: 32px;
  text-align: left;
}

#menu button:hover {
  background-color: lightgray;
}
</style>