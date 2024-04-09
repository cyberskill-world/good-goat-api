import { copyFileSync, ensureDirSync, readdirSync, statSync } from 'fs-extra';
import { dirname, extname, join } from 'path';

export const copyFiles = (srcDir: string, destDir: string, extension: string): void => {
    // Get a list of files and directories in the source directory
    const items = readdirSync(srcDir);

    // Iterate through each item
    items.forEach((item) => {
        // Get the full path of the current item
        const srcPath = join(srcDir, item);
        const destPath = join(destDir, item);

        // Check if the current item is a directory
        if (statSync(srcPath).isDirectory()) {
            // Recursively copy files from the subdirectory
            copyFiles(srcPath, destPath, extension);
        } else {
            // Check if the current file has the correct extension
            if (extname(item) === extension) {
                // Create the destination directory if it doesn't exist
                ensureDirSync(dirname(destPath));

                // Copy the file to the destination directory
                copyFileSync(srcPath, destPath);
            }
        }
    });
};
