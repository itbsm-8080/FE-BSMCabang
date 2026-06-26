<template>
    <div class="master-page p-6">
        <MasterBrowse :config="barangMasterConfig" />
    </div>
</template>

<script setup lang="ts">
import MasterBrowse from '~/components/master/MasterBrowse.vue'
import { barangMasterConfig } from '~/config/master/barang'

definePageMeta({
    layout: 'default'
})
</script>

<style lang="scss" scoped>
.master-page {
    height: 100%;
    padding: 0.5rem;
}
</style>