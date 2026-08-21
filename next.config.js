/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["better-sqlite3", "postgres"], reactStrictMode: true };
module.exports = nextConfig;
