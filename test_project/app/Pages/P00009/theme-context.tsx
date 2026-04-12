"use client";

import { createContext } from "react";

/** 페이지 바깥(모듈)에서 한 번만 정의. 부모는 Provider로 value만 넣어줌. */
export const ThemeContext = createContext<"light" | "dark">("light");
