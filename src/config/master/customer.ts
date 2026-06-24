// config/master/customer.ts
import type { ColumnConfig, FormFieldConfig, MasterConfig } from '~/composables/useMasterCrud'

export const customerColumns: ColumnConfig[] = [
    {
        field: 'Kode',
        header: 'Kode',
        sortable: true,
        minWidth: '100px',
        filterOptionsFrom: 'Kode'  // ✅ TAMBAHKAN
    },
    {
        field: 'Nama',
        header: 'Nama Customer',
        sortable: true,
        minWidth: '200px',
        filterOptionsFrom: 'Nama'  // ✅ TAMBAHKAN
    },
    {
        field: 'Alamat',
        header: 'Alamat',
        sortable: true,
        minWidth: '250px',
        filterOptionsFrom: 'Alamat'  // ✅ TAMBAHKAN
    },
    {
        field: 'Golongan',
        header: 'Golongan',
        sortable: true,
        minWidth: '120px',
        filterOptionsFrom: 'Golongan'
    },
    {
        field: 'Kota',
        header: 'Kota',
        sortable: true,
        minWidth: '120px',
        filterOptionsFrom: 'Kota'
    },
    {
        field: 'Telp',
        header: 'Telepon',
        sortable: true,
        minWidth: '130px',
        filterOptionsFrom: 'Telp'  // ✅ TAMBAHKAN
    },
    {
        field: 'Fax',
        header: 'Fax',
        sortable: true,
        minWidth: '130px',
        filterType: 'text',
        hidden: true
    },
    {
        field: 'Contact',
        header: 'Contact Person',
        sortable: true,
        minWidth: '150px',
        filterType: 'text'
    },
    {
        field: 'Piutang',
        header: 'Piutang',
        type: 'currency',
        sortable: true,
        minWidth: '150px',
        align: 'right'
    },
    {
        field: 'Jenis_Customer',
        header: 'Jenis Customer',
        sortable: true,
        minWidth: '140px',
        filterOptionsFrom: 'Jenis_Customer'
    },
    {
        field: 'NPWP',
        header: 'NPWP',
        sortable: true,
        minWidth: '150px',
        filterType: 'text',
        hidden: true
    },
    {
        field: 'NAMAnpwp',
        header: 'Nama NPWP',
        sortable: true,
        minWidth: '180px',
        filterType: 'text',
        hidden: true
    },
    {
        field: 'ALAMATNPWP',
        header: 'Alamat NPWP',
        sortable: true,
        minWidth: '250px',
        filterType: 'text',
        hidden: true
    },
    {
        field: 'last_paid',
        header: 'Pembayaran Terakhir',
        type: 'date',
        sortable: true,
        minWidth: '150px',
        hidden: true
    },
    {
        field: 'Top',
        header: 'TOP (Hari)',
        type: 'number',
        sortable: true,
        minWidth: '100px',
        align: 'center'
    },
    {
        field: 'Locked',
        header: 'Status',
        sortable: true,
        minWidth: '100px',
        align: 'center',
        filterOptionsFrom: 'Locked'
    },
    {
        field: 'Marketing',
        header: 'Marketing',
        sortable: true,
        minWidth: '150px',
        filterOptionsFrom: 'Marketing'
    }
]

export const customerFormFields: FormFieldConfig[] = [
    {
        field: 'Kode',
        label: 'Kode Customer',
        type: 'text',
        required: true,
        placeholder: 'Masukkan kode customer'
    },
    {
        field: 'Nama',
        label: 'Nama Customer',
        type: 'text',
        required: true,
        placeholder: 'Masukkan nama lengkap customer'
    },
    {
        field: 'Alamat',
        label: 'Alamat',
        type: 'textarea',
        placeholder: 'Masukkan alamat lengkap'
    },
    {
        field: 'Kota',
        label: 'Kota',
        type: 'text',
        placeholder: 'Kota'
    },
    {
        field: 'Telp',
        label: 'Telepon',
        type: 'text',
        placeholder: 'Nomor telepon'
    },
    {
        field: 'Fax',
        label: 'Fax',
        type: 'text',
        placeholder: 'Nomor fax'
    },
    {
        field: 'Contact',
        label: 'Contact Person',
        type: 'text',
        placeholder: 'Nama contact person'
    },
    {
        field: 'Email',
        label: 'Email',
        type: 'text',
        placeholder: 'Alamat email'
    },
    {
        field: 'Golongan',
        label: 'Golongan',
        type: 'select',
        placeholder: 'Pilih golongan'
    },
    {
        field: 'Jenis_Customer',
        label: 'Jenis Customer',
        type: 'select',
        placeholder: 'Pilih jenis customer'
    },
    {
        field: 'Top',
        label: 'TOP (Hari)',
        type: 'number',
        placeholder: '0',
        helpText: 'Term of Payment dalam hari'
    },
    {
        field: 'ShipAddress',
        label: 'Alamat Pengiriman',
        type: 'textarea',
        placeholder: 'Alamat pengiriman (jika berbeda)'
    },
    {
        field: 'NPWP',
        label: 'NPWP',
        type: 'text',
        placeholder: 'Nomor NPWP'
    },
    {
        field: 'NamaNPWP',
        label: 'Nama NPWP',
        type: 'text',
        placeholder: 'Nama terdaftar NPWP'
    },
    {
        field: 'AlamatNPWP',
        label: 'Alamat NPWP',
        type: 'textarea',
        placeholder: 'Alamat sesuai NPWP'
    },
    {
        field: 'KotaNPWP',
        label: 'Kota NPWP',
        type: 'text',
        placeholder: 'Kota sesuai NPWP'
    },
    {
        field: 'Locked',
        label: 'Status Locked',
        type: 'boolean',
        defaultValue: false,
        booleanLabels: { true: 'Locked', false: 'Open' },
        helpText: 'Customer locked tidak dapat melakukan transaksi'
    }
]

export const customerMasterConfig: MasterConfig = {
    title: 'Customer',
    subtitle: 'Kelola data customer, piutang, dan informasi lengkap',
    icon: 'pi-users',
    endpoint: '/v1/customer',
    primaryKey: 'Kode',
    filterOptionsEndpoint: '/v1/customer/filter-options',
    formRoute: '/master/customer/form',
    columns: customerColumns,
    formFields: customerFormFields,

    // ✅ TAMBAHKAN ROW EXPANSION CONFIG
    expansion: {
        enabled: false,
        endpoint: '/v1/customer/{id}/detail', // Endpoint untuk detail
        title: 'Detail Customer',
        columns: [
            { field: 'Kode', header: 'Kode', width: '100px' },
            { field: 'Nama', header: 'Nama', minWidth: '200px' },
            { field: 'Alamat', header: 'Alamat', minWidth: '300px' },
            { field: 'Kota', header: 'Kota', width: '120px' },
            { field: 'Telp', header: 'Telepon', width: '130px' },
            { field: 'Contact', header: 'Contact Person', width: '150px' },
            { field: 'Email', header: 'Email', width: '180px' },
            { field: 'TOP', header: 'TOP (Hari)', width: '100px', align: 'center' },
            { field: 'Piutang', header: 'Piutang', width: '150px', align: 'right', type: 'currency' },
            { field: 'Status', header: 'Status', width: '100px', align: 'center' }
        ]
    }
}