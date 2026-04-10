// config/master/barang.ts
import type { ColumnConfig, FormFieldConfig } from '~/composables/useMasterCrud'

export const barangColumns: ColumnConfig[] = [
    { field: 'Kode', header: 'Kode', sortable: true, width: '100px' },
    { field: 'Nama', header: 'Nama Barang', sortable: true },
    { field: 'Satuan', header: 'Satuan', sortable: true, width: '100px' },
    { field: 'Kategori', header: 'Kategori', sortable: true },
    { field: 'Tipe', header: 'Tipe', sortable: true },
    { field: 'HargaJual', header: 'Harga Jual', type: 'currency', sortable: true, width: '150px' },
    { field: 'Stok', header: 'Stok', type: 'number', sortable: true, width: '100px' },
    { field: 'Min', header: 'Min Stok', type: 'number', sortable: true, width: '100px' },
    { field: 'Merk', header: 'Merk', sortable: true },
    { field: 'Product_Focus', header: 'Product Focus', sortable: true, width: '120px' }
]

export const barangFormFields: FormFieldConfig[] = [
    {
        field: 'Kode',
        label: 'Kode Barang',
        type: 'text',
        required: true,
        placeholder: 'Masukkan kode barang'
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
        placeholder: 'Masukkan kategori'
    },
    {
        field: 'Tipe',
        label: 'Tipe',
        type: 'text',
        placeholder: 'Masukkan tipe'
    },
    {
        field: 'HargaJual',
        label: 'Harga Jual',
        type: 'currency',
        placeholder: 'Masukkan harga jual'
    },
    {
        field: 'Min',
        label: 'Minimum Stok',
        type: 'number',
        placeholder: 'Masukkan minimum stok'
    },
    {
        field: 'Merk',
        label: 'Merk',
        type: 'text',
        placeholder: 'Masukkan merk'
    },
    {
        field: 'Disc_Salesman',
        label: 'Diskon Salesman (%)',
        type: 'number',
        placeholder: 'Masukkan diskon salesman'
    },
    {
        field: 'Product_Focus',
        label: 'Product Focus',
        type: 'select',
        options: [
            { label: 'Ya', value: 1 },
            { label: 'Tidak', value: 0 }
        ],
        defaultValue: 0
    }
]