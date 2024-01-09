import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {  createReadStream } from "fs";
import { readdir,  stat } from "fs/promises";
import path from "path";
import mime from "mime-types";

async function walkDirAndFindFiles(absDirPath: string, pathFromRoot: string, filesAndTypes: Array<{
    file: string;
    type: string;
}>) {
  const content = await readdir(absDirPath);
  for (const obj of content) {
    const absPath = path.join(absDirPath, obj);
    const objStat = await stat(absPath);
    if (objStat.isFile()) filesAndTypes.push({
      file: pathFromRoot ? `${pathFromRoot}/${obj}` : obj,
      type: mime.contentType(obj) || "application/octet-stream"
    });
    else await walkDirAndFindFiles(`${absDirPath}/${obj}`, pathFromRoot ? `${pathFromRoot}/${obj}` : obj, filesAndTypes);
  }
}


export async function putDirToBucket(payload: {
    region: string,
    bucketName: string,
    prefixPath: string,
    rootDir: string,
    absPathOfDirRootToUpload: string
}): Promise<Array<{ file: string; type: string; }>> {
  const filesToBeUploaded: Array<{ file: string; type: string; }> = [];
  await walkDirAndFindFiles(payload.absPathOfDirRootToUpload, "", filesToBeUploaded);

  const s3 = new S3Client({ region: payload.region });
  await Promise.all(filesToBeUploaded.map(file => {
    const pathInS3 = payload.prefixPath ? `${payload.prefixPath}/${payload.rootDir}` : payload.rootDir;
    return s3.send(new PutObjectCommand({
      Bucket: payload.bucketName,
      Key: `${pathInS3}/${file.file}`,
      Body: createReadStream(`${payload.absPathOfDirRootToUpload}/${file.file}`),
      ContentType: file.type
    }));
  }));
  return filesToBeUploaded;
}