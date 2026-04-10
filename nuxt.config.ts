import Theme from '@primeuix/themes/aura';

export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',
    devtools: { enabled: true },
    modules: [
        '@primevue/nuxt-module',
        '@nuxtjs/tailwindcss',
        '@pinia/nuxt',
    ],
    srcDir: 'src/',
    css: ['/assets/styles.scss'],
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
    pinia: {
        storesDirs: ['./stores/**'],
    },
    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:8000/api'
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