import "styled-components";
import { lightTheme } from "./theme"; // импорт для типов

declare module "styled-components" {
  export interface DefaultTheme {
    readonly bg: string;
    readonly text: string;
    readonly cardBg: string;
    readonly statusActive: string;
    readonly statusPaused: string;
  }
}
