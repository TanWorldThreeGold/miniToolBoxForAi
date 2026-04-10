export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  app: {
    baseURL: '/miniToolBoxForAi/',
    head: {
      title: 'ToolBox - 个人效率工具箱',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
  nitro: {
    preset: 'github-pages',
  },
  supabase: {
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      include: undefined,
      exclude: ['/calculator', '/currency'],
      cookieRedirect: false,
    },
  },
})
