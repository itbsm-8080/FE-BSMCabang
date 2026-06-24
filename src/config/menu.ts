// config/menu.ts
export interface MenuItem {
    label: string
    icon?: string
    to?: string
    url?: string
    target?: string
    items?: MenuItem[]
    tabTitle?: string     // Override title di tab
    tabIcon?: string      // Override icon di tab
    closable?: boolean    // Tab bisa ditutup?
    separator?: boolean
}

export const menuModel: MenuItem[] = [
    // {
    //     label: 'Dashboard',
    //     icon: 'pi pi-home',
    //     to: '/dashboard',
    //     tabTitle: 'Dashboard',
    //     tabIcon: 'pi pi-home',
    //     closable: false  // Tidak bisa ditutup
    // },
    {
        label: 'Master Data',
        icon: 'pi pi-database',
        items: [
            {
                label: 'Barang',
                icon: 'pi pi-box',
                to: '/master/barang',
                tabTitle: 'Master Barang',
                tabIcon: 'pi pi-box'
            },
            {
                label: 'Customer',
                icon: 'pi pi-users',
                to: '/master/customer',
                tabTitle: 'Customer',
                tabIcon: 'pi pi-users'
            }
        ]
    },
    {
        label: 'Transaksi',
        icon: 'pi pi-shopping-cart',
        items: [
            {
                label: 'Delivery Order',
                icon: 'pi pi-truck',
                to: '/penjualan/do',
                tabTitle: 'Delivery Order',
                tabIcon: 'pi pi-truck'
            }
        ]
    },
    {
        label: 'Komisi',
        icon: 'pi pi-dollar',
        items: [
            {
                label: 'Komisi Salesman',
                icon: 'pi pi-calculator',
                to: '/komisi/salesman/hitung',
                tabTitle: 'Komisi Salesman',
                tabIcon: 'pi pi-calculator'
            }
        ]
    }
]

// 🔥 FLAT MAP: Ambil semua item yang punya "to" (untuk tab auto-register)
export function getFlatMenuItems(): MenuItem[] {
    const flat: MenuItem[] = []

    function flatten(items: MenuItem[]) {
        for (const item of items) {
            if (item.to) {
                flat.push(item)
            }
            if (item.items) {
                flatten(item.items)
            }
        }
    }

    flatten(menuModel)
    return flat
}