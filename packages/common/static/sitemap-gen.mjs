import { sync } from "glob";
import xmlbuilder from "xmlbuilder";
import { writeFileSync } from 'fs'
import path from "path";
import config from './config.json' assert { type: "json" };

export const generateSitemapXml = (baseUrl) => {
  if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, baseUrl.length - 1)

  const outputFilePath = "build/sitemap.xml";

  const sitemap = xmlbuilder
    .create("urlset", { version: "1.0", encoding: "UTF-8" })
    .att("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");

  const addUrlToSitemap = (url, lastmod) => {
    sitemap.ele("url")
      .ele("loc", {}, url)
      .up()
      .ele("lastmod", {}, lastmod)
  };

  const files = sync('build/**/*.html');

  files.forEach((file) => {
    const lastmod = new Date().toISOString();

    const parsedPath = path.parse(file)
    const pathArray = [...parsedPath.dir.split(path.sep), parsedPath.name]

    if (pathArray.at(-1) === 'index') pathArray.pop();
    if (pathArray.at(0) === 'build') pathArray.shift();

    const pathSlug = pathArray.join("/")
    let url = `${baseUrl}/${pathSlug}`;
    if (!url.endsWith('/')) url = url + '/'

    addUrlToSitemap(url, lastmod);
  });

  const xmlString = sitemap.end({ pretty: true });

  writeFileSync(outputFilePath, xmlString, "utf-8");
};

if (config.urlMapping.baseUrl) generateSitemapXml(config.urlMapping.baseUrl);