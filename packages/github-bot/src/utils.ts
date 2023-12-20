import { existsSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import * as path from "path";

export const getOrCreateTempDir = (folderName: string): string => {
    const tempDir = path.join(tmpdir(), folderName,)

    if (!existsSync(tempDir)) {
        mkdirSync(tempDir);
    }

    return tempDir;
}
