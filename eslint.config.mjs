import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "out/**", "next-env.d.ts", "**/* 2.*"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // CMS ve Supabase Storage medyası çoğunlukla <img> ile basılır; kritik görseller next/image kullanır.
      "@next/next/no-img-element": "off",
      // Mevcut kod tabanı veritabanı satırlarını bilinçli olarak `any` ile taşır.
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
