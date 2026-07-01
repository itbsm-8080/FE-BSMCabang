// config/master/barang.ts
import type { ColumnConfig, FormFieldConfig, MasterConfig } from '~/composables/useMasterCrud'

export const barangColumns: ColumnConfig[] = [
    {
        field: 'Kode',
        header: 'Kode',
        sortable: true,
        minWidth: '120px'
    },
    {
        field: 'Nama',
        header: 'Nama Barang',
        sortable: true,
        minWidth: '200px'
    },
    {
        field: 'Satuan',
        header: 'Satuan',
        sortable: true,
        minWidth: '80px',
        align: 'center'
    },
    {
        field: 'Kategori',
        header: 'Kategori',
        sortable: true,
        minWidth: '120px',
    },
    {
        field: 'Tipe',
        header: 'Tipe',
        sortable: true,
        minWidth: '120px',
    },
    {
        field: 'HargaJual',
        header: 'Harga Jual',
        type: 'currency',
        sortable: true,
        minWidth: '140px',
        align: 'right'
    },
    {
        field: 'Stok',
        header: 'Stok',
        type: 'number',
        sortable: true,
        minWidth: '80px',
        align: 'center'
    },
    {
        field: 'Merk',
        header: 'Merk',
        sortable: true,
        minWidth: '120px',
    },
    {
        field: 'Product_Focus',
        header: 'Focus',
        type: 'boolean',
        sortable: true,
        minWidth: '80px',
        align: 'center',
        booleanLabels: { true: 'Ya', false: 'Tidak' },
        booleanSeverity: { true: 'success', false: 'secondary' }
    }
]

export const barangFormFields: FormFieldConfig[] = [
    {
        field: 'Kode',
        label: 'Kode Barang',
        type: 'text',
        required: true,
        placeholder: 'Masukkan kode unik'
    },
    {
        field: 'Nama',
        label: 'Nama Barang',
        type: 'text',
        required: true,
        placeholder: 'Masukkan nama barang'
    },
    {
        field: 'Satuan',
        label: 'Satuan',
        type: 'text',
        required: true,
        placeholder: 'Contoh: PCS, UNIT, BOX'
    },
    {
        field: 'Kategori',
        label: 'Kategori',
        type: 'text',
        placeholder: 'Kategori barang'
    },
    {
        field: 'Tipe',
        label: 'Tipe',
        type: 'text',
        placeholder: 'Tipe barang'
    },
    {
        field: 'HargaJual',
        label: 'Harga Jual',
        type: 'currency',
        placeholder: '0'
    },
    {
        field: 'Min',
        label: 'Minimum Stok',
        type: 'number',
        placeholder: '0',
        helpText: 'Peringatan jika stok di bawah nilai ini'
    },
    {
        field: 'Merk',
        label: 'Merk',
        type: 'text',
        placeholder: 'Merk barang'
    },
    {
        field: 'Product_Focus',
        label: 'Produk Fokus?',
        type: 'boolean',
        defaultValue: false
    }
]

export const barangMasterConfig: MasterConfig = {
    endpoint: '/v1/barang',
    primaryKey: 'Kode',
    formRoute: '/persediaan/barang/form',
    showPeriod: false,
    columns: barangColumns,
    formFields: barangFormFields,
    expansion: {
        enabled: true,
        endpoint: '/v1/barang/all-detail-stok',
        title: 'Detail Stok',
        columns: [
            { field: 'KD_Gudang', header: 'Kode Gudang', width: '120px' },
            { field: 'Gudang', header: 'Nama Gudang', minWidth: '200px' },
            { field: 'Expired', header: 'Expired', width: '150px' },
            { field: 'Stok', header: 'Stok', width: '120px', align: 'right', type: 'number' }
        ]
    }
}