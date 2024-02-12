import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {  createReadStream } from "fs";
import { readdir,  stat } from "fs/promises";
import path from "path";
import mime from "mime-types";
import { v4 } from "uuid";


const s3 = new S3Client({ region: "us-east-1" });

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
    bucketName: string,
    prefixPath: string,
    rootDir: string,
    absPathOfDirRootToUpload: string
}): Promise<Array<{ file: string; type: string; }>> {
  const filesToBeUploaded: Array<{ file: string; type: string; }> = [];
  await walkDirAndFindFiles(payload.absPathOfDirRootToUpload, "", filesToBeUploaded);

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
;
export async function getUploadUrl(contentType: string): Promise<{
  url: string;
  destFileUrl: string;
  destFilepath: string;
}> {
  const destFilepath = `public/${v4()}`;
  const destFileUrl = `https://documentden-deployments.s3.amazonaws.com/${destFilepath}`;
  const command = new PutObjectCommand({
    Bucket: "documentden-deployments",
    Key: destFilepath,
    ContentType: contentType
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 120 });
  return {
    url,
    destFilepath,
    destFileUrl
  };
}
