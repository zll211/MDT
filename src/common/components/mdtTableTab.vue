<template>
  <el-row class="mdt-tab" type="flex" align="middle" justify="space-between">
    <el-tabs v-model="activeTabName" @tab-click="tabClick" ref="elTabs">
      <el-tab-pane ref="elTabPane" v-for="tab in customTabList" :key="tab.key" :label="tab.label"
                   :name="tab.name"
                   :lazy="true"
                   :disabled="!tab.show">
        <span slot="label"><i v-if="tab.count || tab.count === 0"
                              class="count_number">{{tab.count}}</i>{{tab.label}}</span>
      </el-tab-pane>
    </el-tabs>
  </el-row>
</template>

<script>
  export default {
    name: 'mdtTableTab',
    data() {
      return {
        activeTabName: '',
      };
    },
    model: {
      prop: 'activeTab',
      event: 'input',
    },
    props: {
      mdtTabList: {
        type: Array,
        default: () => [],
      },
      activeTab: '',
    },
    computed: {
      customTabList() {
        return this.mdtTabList.map((tab, index) => ({
          key: index + '-' + tab.count,
          ...tab,
        }));
      },
    },
    created() {

    },
    mounted() {
      this.activeTabName = this.activeTab;
      this.$nextTick(() => {
        let index = this.mdtTabList.findIndex((item) => item.name === this.activeTabName);
        if (index === this.mdtTabList.length - 1) {
          this.$nextTick(() => {
            document.getElementsByClassName('el-tabs__active-bar')[0].style.width =
              parseInt(document.getElementsByClassName('el-tabs__active-bar')[0].style.width) - 20 + 'px';
          });
        }
      });
    },
    watch: {
      activeTab() {
        this.activeTabName = this.activeTab;
      },
    },
    methods: {
      tabClick(tab, event) {
        this.$emit('input', tab.name);
        this.$emit('tab-click', tab, event);
        let index = this.mdtTabList.findIndex((item) => item.label === tab.label);
        if (index === this.mdtTabList.length - 1) {
          this.$nextTick(() => {
            document.getElementsByClassName('el-tabs__active-bar')[0].style.width =
              document.getElementsByClassName('el-tabs__item is-top is-active')[0].clientWidth - 40 + 'px';
          });
        }
      },
    },
  };
</script>

<style lang="scss">
  @import "../../style/variables";

  .mdt-tab {
    .el-tabs__header {
      margin: 0;
    }

    .el-tabs__item {
      color: $mdt-base-default-color;

      &:hover {
        color: $mdt-base-active-color;
      }

      &.is-active {
        color: $mdt-base-active-color;
      }

      &.is-disabled {
        cursor: not-allowed;
      }

      &:last-child {
        margin-right: 5px;
        padding-right: 20px !important;
      }

      .count_number {
        min-width: 14px;
        height: 14px;
        text-align: center;
        position: absolute;
        right: -5px;
        top: 0;
        background-color: #ff6f6f;
        color: #ffffff;
        font-size: 12px;
        line-height: 12px;
        border-radius: 5px;
        padding: 2px;
      }
    }

    .el-tabs__nav-wrap {
      &::after {
        height: 1px;
      }
    }

    .el-tabs__nav-scroll {
      overflow: visible;
    }
  }
</style>
