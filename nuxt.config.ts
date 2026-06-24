import Theme from '@primeuix/themes/aura';

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: [
        '@primevue/nuxt-module',
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
        '@nuxtjs/google-fonts',
    ],
    srcDir: 'src/',
    css: ['/assets/styles.scss'],
    googleFonts: {
        families: {
            'Plus+Jakarta+Sans': [300, 400, 500, 600, 700, 800],
        },
        display: 'swap',
        preload: true,
        useStylesheet: true,
    },
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {}
        }
    },
    primevue: {
        options: {
            ripple: true,
            theme: {
                preset: Theme,
                options: {
                    darkModeSelector: '.app-dark'
                }
            }
        }
    },
    plugins: ['~/plugins/primevue.js', '~/plugins/axios.ts', '~/plugins/auth.client.ts'],
    app: {
        head: {
            charset: 'utf-8',
            viewport: 'width=device-width, initial-scale=1',
            title: 'BSM Cabang'
        },
    },
    router: {
        middleware: ['tabs.global']
    },
    pinia: {
        storesDirs: ['./stores/**'],
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:4002/api'
        }
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    silenceDeprecations: ['legacy-js-api'],
                },
            }
        }
    },
});