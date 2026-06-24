import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faHome, faBox, faUsers, faTags, faCalculator, faDollarSign,
    faTruck, faFile, faUser, faCog, faSignOut, faMoon, faSun,
    faPalette, faSearch, faPlus, faPencil, faTrash, faTimes,
    faChevronLeft, faChevronRight, faChevronDown, faEllipsisV,
    faEllipsisH, faRefresh, faFilter, faInbox, faSpinner,
    faExclamationTriangle, faCheck, faTimesCircle, faMinusCircle,
    faArrowRight, faArrowLeft, faThumbtack, faFolderOpen,
    faInfoCircle, faCalendar, faStar, faShield, faBuilding,
    faPhone, faFax, faEnvelope, faMapMarkerAlt, faLock,
    faCheckCircle, faUserPlus, faShoppingCart, faClock,
    faDatabase, faList, faImage, faChartBar, faCircle,
    faSignInAlt, faArrowUp, faArrowDown, faDownload,
    faBars, faGripVertical, faCopy, faPaste, faUndo, faRedo,
    faEye, faEyeSlash, faSave, faPrint, faShare, faExternalLinkAlt,
    faBookmark, faHistory, faBell, faComment, faHeart,
    faCircle as faCircleSolid, faThumbtack as faThumbtackSolid
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
    faHome, faBox, faUsers, faTags, faCalculator, faDollarSign,
    faTruck, faFile, faUser, faCog, faSignOut, faMoon, faSun,
    faPalette, faSearch, faPlus, faPencil, faTrash, faTimes,
    faChevronLeft, faChevronRight, faChevronDown, faEllipsisV,
    faEllipsisH, faRefresh, faFilter, faInbox, faSpinner,
    faExclamationTriangle, faCheck, faTimesCircle, faMinusCircle,
    faArrowRight, faArrowLeft, faThumbtack, faFolderOpen,
    faInfoCircle, faCalendar, faStar, faShield, faBuilding,
    faPhone, faFax, faEnvelope, faMapMarkerAlt, faLock,
    faCheckCircle, faUserPlus, faShoppingCart, faClock,
    faDatabase, faList, faImage, faChartBar, faCircle,
    faSignInAlt, faArrowUp, faArrowDown, faDownload,
    faBars, faGripVertical, faCopy, faPaste, faUndo, faRedo,
    faEye, faEyeSlash, faSave, faPrint, faShare, faExternalLinkAlt,
    faBookmark, faHistory, faBell, faComment, faHeart
)

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
})