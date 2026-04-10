export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  ssr: false,
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  app: {
    head: {
      title: 'ToolBox - 个人效率工具箱',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
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
