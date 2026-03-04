npm i
npm run dev
src/
├── store/uiStore.ts     # 🏪 Zustand: filters, pagination, theme+persist
├── lib/queryClient.ts   # 🔗 Singleton QueryClient  
├── Dashboard.tsx        # 📊 UI + hooks + виртуализация
├── theme.ts             # 🎨 light/dark styled-components
└── styled.d.ts          # 🔧 TS типы для theme
