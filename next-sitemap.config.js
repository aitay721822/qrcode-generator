/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://guid-v7-generator.vercel.app",
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: "weekly",
  priority: 0.7,
  // 自訂路徑 - 手動加入所有語言版本
  additionalPaths: async (config) => {
    const locales = ["en", "zh-Hant"];
    const result = [];

    // 為每個語言加入首頁
    locales.forEach((locale) => {
      result.push({
        loc: `/${locale}`,
        changefreq: "weekly",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      });
    });

    return result;
  },
  // 排除不需要索引的路徑
  exclude: ["/api/*", "/_next/*", "/404", "/500"],
};
