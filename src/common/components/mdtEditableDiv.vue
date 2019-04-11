<template>
  <div class="edit-div"
       v-html="innerText"
       :contenteditable="contenteditable"
       @click="inputClick"
       @focus="isLocked = true"
       @blur="isLocked = false"
       @input="changeText">
  </div>
</template>
<script type="text/ecmascript-6">
  export default {
    name: 'editDiv',
    props: {
      value: {
        type: String,
        default: '',
      },
      contenteditable: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        innerText: this.value,
        isLocked: false,
      };
    },
    watch: {
       value() {
        if (!this.isLocked) {
          this.innerText = this.value;
        }
      },
    },
    computed: {
    },
    methods: {
      changeText() {
        this.$emit('input', this.$el.innerHTML);
       /* setTimeout(()=>{
          let sel = window.getSelection();
          let range = document.createRange();
          range.selectNodeContents(this.$el);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        });*/
      },
      inputClick(e) {
      },
    },
  };
</script>
<style lang="scss" rel="stylesheet/scss">
  .edit-div {
    width: 100%;
    height: 100%;
    min-height: 90px;
    overflow: auto;
    word-break: break-all;
    outline: none;
    user-select: text;
    white-space: pre-wrap;
    text-align: left;
    border: 1px #dcdfe6 solid;
    border-radius: 4px;
    font-size: 14px;
    color: #6f6f6f;
    padding: 5px 10px;
    &[contenteditable=true] {
      user-modify: read-write-plaintext-only;

      &:empty:before {
        content: attr(placeholder);
        display: block;
        color: #ccc;
      }
    }

    &:focus {
      border: 1px #609EFE solid;
    }
  }
</style>
