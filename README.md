# 🛢️ Mini Dashboard Test

## 🚀 Запуск
```bash
npm i
npm run dev
src/
├── store/uiStore.ts           # Zustand persist+selectors
├── lib/queryClient.ts         # QueryClient singleton
├── Dashboard.tsx              # Query+Virtualization+UI
├── theme.ts                   # light/dark styled-components
├── GlobalStyle.tsx            # Global CSS-in-JS
├── styled.d.ts                # TS theme types
└── App.tsx                    # QueryClientProvider
