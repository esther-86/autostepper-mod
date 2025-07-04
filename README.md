# AutoStepper Mod - .sm File Backup Tool

A Node.js tool that recursively scans directories and creates backup files for all `.sm` files found.

## Features

- Recursively scans directories and subdirectories
- Creates `.bak` backup files for all `.sm` files
- Skips files that already have backups
- Provides detailed console output
- Handles errors gracefully

## Installation

1. Make sure you have Node.js installed on your system
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the script with a directory path as an argument:

```bash
node index.js "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
```

Or using npm:
```bash
npm start "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
```

## Example Output

```
Processing directory: C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7
Found 15 .sm files to backup.
Created backup: song1.sm → song1.sm.bak
Created backup: song2.sm → song2.sm.bak
Backup already exists for: song3.sm
Created backup: song4.sm → song4.sm.bak
Backup process completed successfully!
```

## How it Works

1. The script takes a directory path as a command line argument
2. It recursively scans the directory and all subdirectories
3. Finds all files with `.sm` extension
4. For each `.sm` file, creates a backup with `.bak` extension
5. Skips files that already have backup files
6. Provides progress feedback in the console

## Error Handling

- Validates that the provided directory exists
- Handles permission errors gracefully
- Continues processing even if individual files fail
- Provides clear error messages

## Dependencies

- `fs-extra`: Enhanced file system operations with promise support 