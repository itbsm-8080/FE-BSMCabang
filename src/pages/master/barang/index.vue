<template>
    <div class="master-page">
        <MasterBrowse 
            endpoint="/v1/barang"
            primary-key="Kode"
            title="Barang"
            :columns="barangColumns"
            :form-fields="barangFormFields"
        />
    </div>
</template>

<script setup lang="ts">
import MasterBrowse from '~/components/master/MasterBrowse.vue'
import { barangColumns, barangFormFields } from '~/config/master/barang'

definePageMeta({
    layout: 'default'
})
</script>

<style lang="scss" scoped>
.master-page {
    height: 100%;
}
</style>