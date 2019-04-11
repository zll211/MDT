<template>
  <button
    v-move
    class="hover-btn"
    v-show="meetingHover"
    @click="openMeeting"
    :style="{'left': left + 'px', 'top': top + 'px'}"
  >
  </button>
</template>

<script src="./hoverButton.component.js"></script>
<style lang="scss" src="./hoverButton.scss"></style>
