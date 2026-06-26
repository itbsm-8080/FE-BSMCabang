// composables/usePermission.ts
import { usePermissionStore } from '~/stores/permission'

export function usePermission() {
    const permStore = usePermissionStore()

    // 🔥 SEMUA INSTANT (dari store, no API call)
    const checkAccess = (menuId: number) => permStore.getHakByMenuId(menuId)
    const checkRouteAccess = (route: string) => permStore.canAccessRoute(route)
    const getHakByRoute = (route: string) => permStore.getHakByRoute(route)

    // 🔥 Get menu ID dari route (dari store)
    const getMenuIdByRoute = (route: string): number | null => {
        const menu = permStore.menuList.find((m: any) => m.men_route === route)
        return menu?.MEN_ID || null
    }

    return { checkAccess, checkRouteAccess, getHakByRoute, getMenuIdByRoute }
}