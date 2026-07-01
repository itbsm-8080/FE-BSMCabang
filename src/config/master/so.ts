import type { ColumnConfig, FormFieldConfig, MasterConfig } from '~/composables/useMasterCrud'

export const soColumns: ColumnConfig[] = [
    { field: 'Nomor', header: 'Nomor', minWidth: '120px' },
    { field: 'Tanggal', header: 'Tanggal', type: 'date', minWidth: '90px' },
    { field: 'Customer', header: 'Customer', minWidth: '180px' },
    { field: 'Salesman', header: 'Salesman', minWidth: '150px' },
    { field: 'Total', header: 'Total', type: 'currency', minWidth: '120px', align: 'right' },
    { field: 'Ppn', header: 'PPN', type: 'currency', minWidth: '100px', align: 'right' },
    { field: 'Closed', header: 'Closed', minWidth: '80px', align: 'center' },
    { field: 'Kirim', header: 'Kirim', minWidth: '80px', align: 'center' },
    { field: 'Eceran', header: 'Eceran', minWidth: '80px', align: 'center' },
    { field: 'Memo', header: 'Memo', minWidth: '200px' },
]

export const soMasterConfig: MasterConfig = {
    endpoint: '/v1/so',
    primaryKey: 'Nomor',
    formRoute: '/penjualan/so/form',
    showPeriod: true,
    columns: soColumns,
    formFields: [],
    expansion: {
        enabled: true,
        endpoint: '/v1/so/{id}/detail',
        title: 'Detail Items',
        columns: [
            { field: 'Kode', header: 'Kode', width: '80px' },
            { field: 'Nama', header: 'Nama Barang', minWidth: '180px' },
            { field: 'Satuan', header: 'Sat', width: '60px', align: 'center' },
            { field: 'Jumlah', header: 'Qty', width: '60px', type: 'number', align: 'center' },
            { field: 'Harga', header: 'Harga', width: '100px', type: 'currency', align: 'right' },
            { field: 'Disc', header: 'Disc%', width: '60px', type: 'number', align: 'center' },
            { field: 'Nilai', header: 'Nilai', width: '110px', type: 'currency', align: 'right' },
        ]
    }
}