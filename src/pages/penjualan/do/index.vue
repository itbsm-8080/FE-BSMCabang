<template>
    <div class="do-browse-page">
        <DoBrowse />
    </div>
</template>

<script setup lang="ts">
import DoBrowse from '~/components/penjualan/DoBrowse.vue'

definePageMeta({
    layout: 'default'
})
</script>

<style lang="scss" scoped>
.do-browse-page {
    height: 100%;
}
</style>