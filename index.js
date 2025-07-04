const fs = require('fs-extra');
const path = require('path');

/**
 * Creates backup files for all .sm files in a directory and its subdirectories
 * @param {string} directoryPath - The path to the directory to process
 */
async function backupSmFiles(directoryPath) {
    try {
        // Check if the directory exists
        if (!await fs.pathExists(directoryPath)) {
            console.error(`Error: Directory "${directoryPath}" does not exist.`);
            return;
        }

        console.log(`Processing directory: ${directoryPath}`);

        // Get all files in the directory and subdirectories
        const files = await getAllFiles(directoryPath);

        // Filter for .sm files
        const smFiles = files.filter(file => path.extname(file).toLowerCase() === '.sm');

        console.log(`Found ${smFiles.length} .sm files to backup.`);

        // Create backup for each .sm file
        for (const filePath of smFiles) {
            await createBackup(filePath);
        }

        console.log('Backup process completed successfully!');

    } catch (error) {
        console.error('Error during backup process:', error.message);
    }
}

/**
 * Recursively gets all files in a directory and its subdirectories
 * @param {string} dir - The directory to scan
 * @returns {Promise<string[]>} Array of file paths
 */
async function getAllFiles(dir) {
    const files = [];

    try {
        const items = await fs.readdir(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = await fs.stat(fullPath);

            if (stat.isDirectory()) {
                // Recursively get files from subdirectories
                const subFiles = await getAllFiles(fullPath);
                files.push(...subFiles);
            } else {
                // Add file to the list
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not read directory ${dir}: ${error.message}`);
    }

    return files;
}

/**
 * Creates a backup file for a given .sm file
 * @param {string} filePath - Path to the .sm file
 */
async function createBackup(filePath) {
    try {
        const backupPath = filePath.replace('.sm', '') + '.bak';

        // Check if backup already exists
        if (await fs.pathExists(backupPath)) {
            console.log(`Backup already exists for: ${path.basename(filePath)}`);
            return;
        }

        // Copy the file to create backup
        await fs.copy(filePath, backupPath);
        console.log(`Created backup: ${path.basename(filePath)} → ${path.basename(backupPath)}`);

    } catch (error) {
        console.error(`Error creating backup for ${filePath}: ${error.message}`);
    }
}

// Main execution
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node index.js <directory_path>');
        console.log('Example: node index.js "C:\\Users\\mysti\\Desktop\\Repositories\\AutoStepper-Java-v1.7"');
        process.exit(1);
    }

    const directoryPath = args[0];

    // Validate the path
    if (!directoryPath || directoryPath.trim() === '') {
        console.error('Error: Please provide a valid directory path.');
        process.exit(1);
    }

    // Start the backup process
    backupSmFiles(directoryPath);
}

// Run the script if called directly
if (require.main === module) {
    main();
}

module.exports = { backupSmFiles, getAllFiles, createBackup }; 