<template>
    <div class="max-w-full pb-10">
        
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-extrabold text-gray-800 tracking-tight">{{ isEdit ? 'Edit Delivery Order' : 'Buat Delivery Order' }}</h1>
                <p class="text-sm text-gray-500 mt-1">Kelola pengiriman barang dari Gudang ke Customer.</p>
            </div>
            <div class="flex gap-3">
                <Button label="Batal" icon="pi pi-times" severity="secondary" text @click="cancel" />
                <Button label="Simpan Dokumen" icon="pi pi-check" severity="primary" @click="saveData" :loading="saving" class="shadow-lg shadow-blue-500/30 px-6" />
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i class="pi pi-info-circle text-blue-500"></i> Informasi DO
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor SO</label>
                    <div class="flex">
                        <InputText v-model="form.so_nomor" disabled class="w-full bg-gray-50 !rounded-r-none" />
                        <Button icon="pi pi-search" @click="searchSO" class="!rounded-l-none px-4" severity="secondary" />
                    </div>
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</label>
                    <InputText v-model="form.customer" disabled class="bg-gray-50 font-medium" />
                </div>

                <div class="flex flex-col gap-2 md:col-span-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Alamat Lengkap</label>
                    <InputText v-model="form.alamat" disabled class="bg-gray-50" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Nomor DO</label>
                    <InputText v-model="form.nomor" disabled class="bg-gray-50 text-blue-700 font-bold" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal Kirim</label>
                    <Calendar v-model="form.tanggal" dateFormat="yy-mm-dd" showIcon class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Gudang Asal</label>
                    <Select v-model="form.gudang" :options="gudangOptions" optionLabel="nama" optionValue="kode" placeholder="Pilih Gudang" class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Catatan / Memo</label>
                    <InputText v-model="form.memo" placeholder="Masukkan catatan tambahan..." />
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <h2 class="text-md font-bold text-gray-800 flex items-center gap-2">
                    <i class="pi pi-box text-blue-500"></i> Detail Item
                </h2>
                <span class="text-xs bg-white px-3 py-1 rounded-full border text-gray-500 shadow-sm">
                    Tekan <kbd class="font-mono font-bold text-gray-700">Ctrl+A</kbd> untuk tambah baris
                </span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-white border-b text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th class="p-4 w-12 text-center">No</th>
                            <th class="p-4 w-40">Kode SKU</th>
                            <th class="p-4">Nama Barang</th>
                            <th class="p-4 w-32">ID Batch</th>
                            <th class="p-4 w-28 text-right text-blue-600">Dikirim</th>
                            <th class="p-4 w-24">Satuan</th>
                            <th class="p-4 w-24 text-right">Kurang</th>
                            <th class="p-4 w-16 text-center">Close</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr 
                            v-for="(row, idx) in details" :key="idx"
                            class="border-b last:border-0 hover:bg-blue-50/30 transition-colors"
                        >
                            <td class="p-4 text-center text-sm font-medium text-gray-400">{{ idx + 1 }}</td>
                            
                            <td class="p-2">
                                <div class="flex shadow-sm rounded-md">
                                    <InputText v-model="row.sku" disabled class="w-full text-sm !rounded-r-none bg-gray-50" />
                                    <Button icon="pi pi-search" @click="openModalSKU(row, idx)" severity="secondary" class="!rounded-l-none px-2" size="small" />
                                </div>
                            </td>

                            <td class="p-2">
                                <InputText v-model="row.nama_barang" disabled class="w-full text-sm bg-gray-50 border-transparent" />
                            </td>

                            <td class="p-2">
                                <InputText v-model="row.id_batch" disabled class="w-full text-sm bg-gray-50 border-transparent" />
                            </td>

                            <td class="p-2">
                                <InputNumber 
                                    v-model="row.qty" 
                                    :min="0" :max="row.kurang"
                                    class="w-full !font-bold !text-blue-600"
                                    inputClass="!text-right !bg-blue-50 border-blue-200 focus:border-blue-500"
                                />
                            </td>

                            <td class="p-2">
                                <InputText v-model="row.satuan" disabled class="w-full text-sm bg-gray-50 text-center border-transparent" />
                            </td>

                            <td class="p-2">
                                <InputNumber v-model="row.kurang" disabled class="w-full" inputClass="!text-right !bg-gray-50 !text-red-500 !font-bold border-transparent" />
                            </td>

                            <td class="p-4 text-center">
                                <Checkbox v-model="row.closed" binary />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="p-4 border-t bg-gray-50">
                <Button label="Tambah Baris Manual" icon="pi pi-plus" text size="small" @click="addNewRow" />
            </div>
        </div>

    </div>
</template>

<script setup>
// Pastikan script JS/TS kamu yang lama (yang ada fungsi load data, watch, onMounted) 
// tetap kamu tempel di bawah sini. Aku hanya merombak UI <template>-nya saja.

import { ref, reactive, onMounted, onUnmounted } from 'vue'

const isEdit = ref(false)
const saving = ref(false)
const form = reactive({ nomor: '', tanggal: new Date(), so_nomor: '', customer: '', alamat: '', memo: '', gudang: '' })
const details = ref([])
const gudangOptions = ref([{kode: 'GDG1', nama: 'Gudang Pusat'}]) // Contoh dummy

const addNewRow = () => {
    details.value.push({ sku: '', nama_barang: '', id_batch: '', qty: 0, satuan: '', kurang: 0, closed: false })
}

const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'a') {
        event.preventDefault()
        addNewRow()
    }
}

onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    if(details.value.length === 0) addNewRow()
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
})
</script>