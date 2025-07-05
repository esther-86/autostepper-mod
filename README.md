# AutoStepper Mod - .sm File Processing Tool

A Node.js tool that processes `.sm` files to modify or extract Beginner difficulty sections. The tool can either replace existing Beginner sections or insert new ones with modified step data.

## Features

- Recursively scans directories and subdirectories
- Creates `.bak` backup files for all `.sm` files before processing
- Extracts and displays Beginner content from .sm files
- Processes and replaces Beginner content with modified step data
- **NEW**: Inserts new Beginner sections with difficulty "1:" instead of "2:"
- **NEW**: Inserts new sections after `#ATTACKS:;` instead of replacing existing content
- Provides detailed console output
- Handles errors gracefully

## Installation

1. Make sure you have Node.js installed on your system
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the script with a mode and directory path as arguments:

```bash
# Extract and display Beginner content (default mode)
node index.js extract "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"

# Process and replace existing Beginner content
node index.js process "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"

# Process and replace existing Beginner content (same as process)
node index.js replace "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"

# Process and insert new Beginner content after #ATTACKS:;
node index.js insert "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
```

Or using npm:
```bash
npm start extract "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
npm start process "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
npm start insert "C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7"
```

## Modes

### Extract Mode
Extracts and displays Beginner content from .sm files without modifying them.

### Process/Replace Mode
Processes Beginner content by replacing step data with simplified patterns and replaces the original content in the file.

### Insert Mode (NEW)
Processes Beginner content and creates a new section with:
- Difficulty level "1:" instead of "2:"
- Inserted after the `#ATTACKS:;` line
- Original content remains unchanged

## Example Output

```
Processing directory: C:\Users\mysti\Desktop\Repositories\AutoStepper-Java-v1.7
Found 15 .sm files to process.
Created backup: song1.sm → song1.sm.bak
Processing and insertion process completed successfully!
```

## How it Works

1. The script takes a mode and directory path as command line arguments
2. It recursively scans the directory and all subdirectories
3. Finds all files with `.sm` extension
4. Creates backup files with `.bak` extension before processing
5. Based on the mode:
   - **Extract**: Displays Beginner content without modification
   - **Process/Replace**: Replaces existing Beginner content with processed step data
   - **Insert**: Creates new Beginner section with difficulty "1:" after `#ATTACKS:;`
6. Provides progress feedback in the console

## Error Handling

- Validates that the provided directory exists
- Handles permission errors gracefully
- Continues processing even if individual files fail
- Provides clear error messages

## Dependencies

- `fs-extra`: Enhanced file system operations with promise support 