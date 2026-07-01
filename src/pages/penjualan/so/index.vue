<template>
    <div class="master-page">
        <MasterBrowse :config="soMasterConfig" />
    </div>
</template>

<script setup lang="ts">
import MasterBrowse from '~/components/master/MasterBrowse.vue'
import { soMasterConfig } from '~/config/master/so'

definePageMeta({ layout: 'default' })
</script>

<style lang="scss" scoped>
.master-page { height: 100%; padding: 0.5rem; }
</style>