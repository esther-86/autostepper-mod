const fs = require('fs-extra');
const path = require('path');
const SmProcessor = require('../smProcessor');

describe('SmProcessor', () => {
    const testDir = path.join(__dirname);
    const backupFile = path.join(testDir, 'All Honor and Glory.mp3.bak');
    const insertedFile = path.join(testDir, 'All Honor and Glory.mp3.inserted');
    const replacedFile = path.join(testDir, 'All Honor and Glory.mp3.replaced');
    const tempSmFile = path.join(testDir, 'temp_test.sm');

    beforeEach(async () => {
        // Clean up any existing temp file
        if (await fs.pathExists(tempSmFile)) {
            await fs.remove(tempSmFile);
        }
    });

    afterEach(async () => {
        // Clean up temp file after each test
        if (await fs.pathExists(tempSmFile)) {
            await fs.remove(tempSmFile);
        }
    });

    const testCases = [
        {
            name: 'should insert new Beginner section with steps: 1:',
            sectionToExtract: 'Beginner:2',
            action: 'Insert Before',
            newSectionName: 'Novice:1',
            expectedFile: insertedFile,
            description: 'Insert Mode'
        },
        {
            name: 'should replace Beginner section with steps: 2:',
            sectionToExtract: 'Beginner:2',
            action: 'Replace',
            newSectionName: 'Beginner:2',
            expectedFile: replacedFile,
            description: 'Replace Mode'
        }
    ];

    test.each(testCases)('$description - $name', async ({ sectionToExtract, action, newSectionName, expectedFile }) => {
        // 1. Copy .bak to .sm
        await fs.copy(backupFile, tempSmFile);

        // 2. Process with specified mode
        const processor = new SmProcessor();
        await processor.processAndHandleBeginnerContent(tempSmFile, sectionToExtract, action, newSectionName);

        // 3. Content should match expected file
        const actualContent = await fs.readFile(tempSmFile, 'utf8');
        const expectedContent = await fs.readFile(expectedFile, 'utf8');

        expect(actualContent).toBe(expectedContent);
    });
});