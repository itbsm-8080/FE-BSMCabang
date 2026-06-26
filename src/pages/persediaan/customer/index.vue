<template>
    <div class="master-page">
        <MasterBrowse :config="customerMasterConfig" />
    </div>
</template>

<script setup lang="ts">
import MasterBrowse from '~/components/master/MasterBrowse.vue'
import { customerMasterConfig } from '~/config/master/customer'

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