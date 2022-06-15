<template>
  <div>
    <v-group :config="configGroup">
      <v-text ref="text" :config="configText" @dblclick="onDblclick"></v-text>
    </v-group>
  </div>
</template>

<script>
const FONT_FAMILY = 'Arial,BIZ UDPGothic'
const PADDING = 6

export default {
  props: {
    id: String,
    text: String,
    x: Number,
    y: Number,
  },
  data() {
    return {
      labelText: this.text
    }
  },
  computed: {
    configGroup() {
      return { 
        x: this.x,
        y: this.y,
        id: `${this.id}|${this.labelText}`,
        draggable: true
      }
    },
    configText() {
      return {
        fontFamily: FONT_FAMILY,
        padding: PADDING,
        text: this.labelText
      }
    },
  },
  methods: {
    changeText (text) {
      this.labelText = text;
      this.$nextTick(() => this.$emit('change'));
    },

    onDblclick () {
      const textNode = this.$refs.text.getNode();

      // hide text node and transformer:
      textNode.hide();

      // create textarea over canvas with absolute position
      // first we need to find position for textarea
      // how to find it?

      // at first lets find position of text node relative to the stage:
      const textPosition = textNode.absolutePosition();

      // so position of textarea will be the sum of positions above:
      // 現在の仕様だと stage.container() の offset は考慮不要だったので削除した
      const areaPosition = {
        x: textPosition.x,
        y: textPosition.y,
      };

      // create textarea and style it
      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);

      // apply many styles to match text on canvas as close as possible
      // remember that text rendering on canvas and on the textarea can be different
      // and sometimes it is hard to make it 100% the same. But we will try...
      textarea.value = textNode.text();
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
      textarea.style.height =
        textNode.height() - textNode.padding() * 2 + 5 + 'px';
      textarea.style.fontSize = textNode.fontSize() + 'px';
      textarea.style.border = 'none';
      textarea.style.padding = '0px';
      textarea.style.margin = PADDING + 'px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.lineHeight = textNode.lineHeight();
      textarea.style.fontFamily = textNode.fontFamily();
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = textNode.align();
      textarea.style.color = textNode.fill();

      const px = 0;
      // also we need to slightly move textarea on firefox
      // because it jumps a bit
      const isFirefox =
        navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
      if (isFirefox) {
        px += 2 + Math.round(textNode.fontSize() / 20);
      }
      const transform = 'translateY(-' + px + 'px)';

      textarea.style.transform = transform;

      // reset height
      textarea.style.height = 'auto';
      // after browsers resized it we can set actual value
      textarea.style.height = textarea.scrollHeight + 3 + 'px';

      textarea.focus();

      function removeTextarea() {
        textarea.parentNode.removeChild(textarea);
        window.removeEventListener('click', handleOutsideClick);
        textNode.show();
      }

      function setTextareaWidth(newWidth) {
        if (!newWidth) {
          // set width for placeholder
          newWidth = textNode.placeholder.length * textNode.fontSize();
        }
        // some extra fixes on different browsers
        const isSafari = /^((?!chrome|android).)*safari/i.test(
          navigator.userAgent
        );
        const isFirefox =
          navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        if (isSafari || isFirefox) {
          newWidth = Math.ceil(newWidth);
        }

        const isEdge =
          document.documentMode || /Edge/.test(navigator.userAgent);
        if (isEdge) {
          newWidth += 1;
        }
        textarea.style.width = newWidth + 'px';
      }

      const $vm = this;
      textarea.addEventListener('keydown', function (e) {
        // hide on enter
        // but don't hide on shift + enter
        if (e.keyCode === 13 && !e.shiftKey) {
          $vm.changeText(textarea.value);
          removeTextarea();
        }
        // on esc do not set value back to node
        if (e.keyCode === 27) {
          removeTextarea();
        }
      });

      textarea.addEventListener('keydown', function (e) {
        const scale = textNode.getAbsoluteScale().x;
        setTextareaWidth(textNode.width() * scale);
        textarea.style.height = 'auto';
        textarea.style.height =
          textarea.scrollHeight + textNode.fontSize() + 'px';
      });

      function handleOutsideClick(e) {
        if (e.target !== textarea) {
          $vm.changeText(textarea.value);
          removeTextarea();
        }
      }
      setTimeout(() => {
        window.addEventListener('click', handleOutsideClick);
      });
    }
  }
}
</script>

<style>

</style>