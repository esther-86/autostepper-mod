const fs = require('fs-extra');

/**
 * Class to process .sm files and modify specific sections
 */
class SmProcessor {
    constructor(replace = false) {
        this.replace = replace;
        this.targetSection = {
            style: 'dance-single:',
            difficulty: 'Beginner:',
            steps: '2:'
        };
        this.newSection = {
            style: 'dance-single:',
            difficulty: 'Beginner:',
            steps: '1:'
        };
    }

    /**
     * Process a .sm file after backup creation
     * @param {string} filePath - Path to the .sm file
     */
    async processSmFile(filePath) {
        try {
            console.log(`Processing .sm file: ${filePath}`);

            // Read the file content
            const content = await fs.readFile(filePath, 'utf8');

            // Parse the content into sections
            const sections = this.parseSections(content);

            // Find and process the target section
            const processedSections = this.processSections(sections);

            // Reconstruct the file content
            const newContent = this.reconstructContent(processedSections);

            // Write the modified content back to the file
            await fs.writeFile(filePath, newContent, 'utf8');

            console.log(`Successfully processed: ${filePath}`);

        } catch (error) {
            console.error(`Error processing ${filePath}: ${error.message}`);
        }
    }

    /**
     * Parse the .sm file content into sections
     * @param {string} content - The file content
     * @returns {Array} Array of section objects
     */
    parseSections(content) {
        const sections = [];
        const lines = content.split('\n');
        let currentSection = null;
        let sectionLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Check if this line starts a new section
            if (this.isSectionStart(line)) {
                // Save previous section if exists
                if (currentSection) {
                    sections.push({
                        type: currentSection,
                        lines: sectionLines,
                        startIndex: i - sectionLines.length
                    });
                }

                // Start new section
                currentSection = this.getSectionType(line);
                sectionLines = [line];
            } else {
                // Add line to current section
                if (currentSection) {
                    sectionLines.push(line);
                }
            }
        }

        // Add the last section
        if (currentSection) {
            sections.push({
                type: currentSection,
                lines: sectionLines,
                startIndex: lines.length - sectionLines.length
            });
        }

        return sections;
    }

    /**
     * Check if a line starts a new section
     * @param {string} line - The line to check
     * @returns {boolean} True if it's a section start
     */
    isSectionStart(line) {
        const trimmed = line.trim();
        return trimmed.startsWith('#NOTES:') ||
            trimmed.startsWith('//') && trimmed.includes('dance-single');
    }

    /**
     * Get the section type from a line
     * @param {string} line - The line to analyze
     * @returns {string} The section type
     */
    getSectionType(line) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#NOTES:')) {
            return 'notes';
        } else if (trimmed.includes('dance-single')) {
            return 'dance-single';
        }
        return 'unknown';
    }

    /**
     * Process sections and identify target sections
     * @param {Array} sections - Array of section objects
     * @returns {Array} Processed sections
     */
    processSections(sections) {
        return sections.map(section => {
            if (section.type === 'notes') {
                const processedSection = this.processNotesSection(section);
                if (processedSection.isTarget) {
                    console.log(`Found target section in ${section.type}:`);
                    this.printSectionContent(processedSection.lines);
                }
                return processedSection;
            }
            return section;
        });
    }

    /**
     * Process a notes section to identify target sections
     * @param {Object} section - The section object
     * @returns {Object} Processed section
     */
    processNotesSection(section) {
        const lines = [...section.lines];
        const processedLines = [];
        let isTarget = false;
        let inTargetSubsection = false;
        let subsectionLines = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Check if this line starts a dance-single subsection
            if (trimmed === this.targetSection.style) {
                inTargetSubsection = true;
                subsectionLines = [line];
            } else if (inTargetSubsection) {
                subsectionLines.push(line);

                // Check if we have enough lines to identify the target
                if (subsectionLines.length >= 4) {
                    const styleLine = subsectionLines[0].trim();
                    const difficultyLine = subsectionLines[2].trim();
                    const stepsLine = subsectionLines[3].trim();

                    if (styleLine === this.targetSection.style &&
                        difficultyLine === this.targetSection.difficulty &&
                        stepsLine === this.targetSection.steps) {
                        isTarget = true;
                        console.log(`Target section identified: ${styleLine} ${difficultyLine} ${stepsLine}`);
                    }
                }
            } else {
                // Not in target subsection, add line as-is
                processedLines.push(line);
            }
        }

        return {
            ...section,
            lines: processedLines,
            isTarget,
            targetSubsection: isTarget ? subsectionLines : null
        };
    }

    /**
     * Print the content of a section using utility function
     * @param {Array} lines - The lines to print
     */
    printSectionContent(lines) {
        /*
        console.log('=== Section Content ===');
        lines.forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
        console.log('======================');
        */
    }

    /**
     * Reconstruct the file content from processed sections
     * @param {Array} sections - Processed sections
     * @returns {string} Reconstructed content
     */
    reconstructContent(sections) {
        return sections.map(section => section.lines.join('\n')).join('\n');
    }

    /**
     * Utility function to print section content (can be called externally)
     * @param {string} filePath - Path to the .sm file
     */
    async printTargetSection(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const sections = this.parseSections(content);

            sections.forEach(section => {
                if (section.type === 'notes') {
                    const processed = this.processNotesSection(section);
                    if (processed.isTarget) {
                        console.log(`\nTarget section found in ${filePath}:`);
                        this.printSectionContent(processed.targetSubsection);
                    }
                }
            });
        } catch (error) {
            console.error(`Error reading ${filePath}: ${error.message}`);
        }
    }

    /**
     * Extract and print content between "Beginner: 2:" and the next difficulty level
     * @param {string} filePath - Path to the .sm file
     */
    async extractBeginnerContent(filePath) {
        try {
            console.log(`Extracting Beginner content from: ${filePath}`);

            // Read the file content
            const content = await fs.readFile(filePath, 'utf8');

            // Parse the content into sections
            const sections = this.parseSections(content);

            // Find and extract the Beginner content
            for (const section of sections) {
                if (section.type === 'notes') {
                    const result = this.extractBeginnerFromSection(section);
                    // this.printSectionContent(result.content);
                }
            }

        } catch (error) {
            console.error(`Error extracting Beginner content from ${filePath}: ${error.message}`);
        }
    }

    /**
     * Extract Beginner content from a notes section (extraction only)
     * @param {Object} section - The section object
     * @returns {Object} Object containing extraction results
     */
    extractBeginnerFromSection(section) {
        const lines = section.lines;
        let inDanceSingle = false;
        let inBeginner = false;
        let beginnerContent = [];
        let foundBeginner = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Check if we're entering a dance-single section
            if (trimmed === 'dance-single:') {
                inDanceSingle = true;
                continue;
            }

            // If we're in a dance-single section, look for Beginner
            if (inDanceSingle) {
                // Check if this is the Beginner: 2: line
                if (trimmed === 'Beginner:') {
                    inBeginner = true;
                    foundBeginner = true;
                    beginnerContent = []; // Reset content
                    continue;
                }

                // If we're in Beginner section, collect content
                if (inBeginner) {
                    // Check if we've hit the next difficulty level
                    if (this.isNextDifficultyLevel(trimmed)) {
                        inBeginner = false;
                        inDanceSingle = false; // Exit dance-single section too
                        break;
                    }

                    // Add line to beginner content (skip the "2:" line)
                    if (trimmed !== '2:') {
                        beginnerContent.push(line);
                    }
                }
            }
        }

        return {
            found: foundBeginner,
            content: beginnerContent
        };
    }

    /**
     * Check if a line indicates the next difficulty level
     * @param {string} line - The line to check
     * @returns {boolean} True if it's the next difficulty level
     */
    isNextDifficultyLevel(line) {
        const difficultyLevels = [
            'Easy:',
            'Medium:',
            'Hard:',
            'Challenge:',
            'Expert:',
            'Master:'
        ];

        return difficultyLevels.some(level => line === level);
    }

    /**
     * Process the Beginner content by applying transformations
     * @param {Array} contentLines - Array of content lines to process
     * @returns {Array} Processed content lines
     */
    processBeginnerContent(contentLines) {
        const processedLines = [];
        let previousLine = null;

        for (let i = 0; i < contentLines.length; i++) {
            const line = contentLines[i];
            const trimmed = line.trim();

            // Skip empty lines or lines that don't contain step data
            if (!trimmed || trimmed === ',' || trimmed === ';') {
                processedLines.push(line);
                continue;
            }

            // Check if this is a step data line (contains 0, 1, 2, or 3)
            // 2: Start of a hold
            // 3: End of a hold
            if (this.isStepDataLine(trimmed)) {
                // Don't replace lines that contain a '3'
                if (trimmed.includes('3')) {
                    processedLines.push(line);
                } else {
                    // Only replace with '0000' if previous line is not '0000'
                    const previousTrimmed = previousLine ? previousLine.trim() : null;
                    if (previousTrimmed !== '0000') {
                        processedLines.push('0000');
                        // Update previous line for next iteration
                        previousLine = '0000';
                    } else {
                        // Keep the original line if previous line was '0000'
                        processedLines.push(line);
                        // Update previous line for next iteration
                        previousLine = line;
                    }
                }
            } else {
                // Keep non-step data lines as-is
                processedLines.push(line);
            }
        }

        return processedLines;
    }

    /**
     * Check if a line contains step data (0s, 1s, and 2s)
     * @param {string} line - The line to check
     * @returns {boolean} True if it's step data
     */
    isStepDataLine(line) {
        // Check if line contains only 0, 1, 2, and possibly spaces
        return /^[012\s]+$/.test(line);
    }

    /**
     * Replace Beginner content in a .sm file
     * @param {string} filePath - Path to the .sm file
     * @param {Array} originalContent - Original Beginner content lines
     * @param {Array} processedContent - Processed Beginner content lines
     */
    async replaceBeginnerContent(filePath, originalContent, processedContent) {
        try {
            // Read the file content
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            // Find the position of the original content in the file
            const replacementInfo = this.findContentPosition(lines, originalContent);

            if (replacementInfo.found) {
                // Replace the original content with processed content
                const newLines = [...lines];
                newLines.splice(replacementInfo.startIndex, replacementInfo.length, ...processedContent);

                // Write the modified content back to the file
                const newContent = newLines.join('\n');
                await fs.writeFile(filePath, newContent, 'utf8');

                console.log(`Successfully replaced Beginner content in: ${filePath}`);
            } else {
                console.log(`Could not find original Beginner content to replace in: ${filePath}`);
            }

        } catch (error) {
            console.error(`Error replacing Beginner content in ${filePath}: ${error.message}`);
        }
    }

    /**
     * Find the position of original content in the file lines
     * @param {Array} fileLines - All lines in the file
     * @param {Array} originalContent - Original content to find
     * @returns {Object} Information about the position
     */
    findContentPosition(fileLines, originalContent) {
        for (let i = 0; i <= fileLines.length - originalContent.length; i++) {
            let match = true;

            for (let j = 0; j < originalContent.length; j++) {
                if (fileLines[i + j] !== originalContent[j]) {
                    match = false;
                    break;
                }
            }

            if (match) {
                return {
                    found: true,
                    startIndex: i,
                    length: originalContent.length
                };
            }
        }

        return {
            found: false,
            startIndex: -1,
            length: 0
        };
    }

    /**
     * Process and handle Beginner content in a .sm file (replace or insert based on mode)
     * @param {string} filePath - Path to the .sm file
     */
    async processAndHandleBeginnerContent(filePath) {
        try {
            const mode = this.replace ? 'replacing' : 'inserting';
            console.log(`Processing and ${mode} Beginner content in: ${filePath}`);

            // Read the file content
            const content = await fs.readFile(filePath, 'utf8');

            // Parse the content into sections
            const sections = this.parseSections(content);

            // Find and process the Beginner content
            for (const section of sections) {
                if (section.type === 'notes') {
                    const result = this.extractBeginnerFromSection(section);
                    if (result.found && result.content.length > 0) {
                        // Process the content
                        const processedContent = this.processBeginnerContent(result.content);

                        if (this.replace) {
                            // Replace the original content with processed content
                            await this.replaceBeginnerContent(filePath, result.content, processedContent);
                        } else {
                            // Insert new section with processed content
                            await this.insertBeginnerContent(filePath, processedContent);
                        }
                    }
                }
            }

        } catch (error) {
            console.error(`Error processing and handling Beginner content in ${filePath}: ${error.message}`);
        }
    }

    /**
     * Find the position after #ATTACKS:; in the file
     * @param {Array} fileLines - All lines in the file
     * @returns {Object} Information about the position
     */
    findAttacksPosition(fileLines) {
        for (let i = 0; i < fileLines.length; i++) {
            const line = fileLines[i].trim();
            if (line === '#ATTACKS:;') {
                return {
                    found: true,
                    startIndex: i + 1 // Position after the #ATTACKS:; line
                };
            }
        }

        return {
            found: false,
            startIndex: -1
        };
    }

    /**
     * Insert new Beginner content in a .sm file after #ATTACKS:;
     * @param {string} filePath - Path to the .sm file
     * @param {Array} processedContent - Processed Beginner content lines
     */
    async insertBeginnerContent(filePath, processedContent) {
        try {
            // Read the file content
            const content = await fs.readFile(filePath, 'utf8');
            const lines = content.split('\n');

            // Find the position after #ATTACKS:;
            const insertInfo = this.findAttacksPosition(lines);

            if (insertInfo.found) {
                // Create the new section content
                const newSectionContent = [
                    '',
                    '//',
                    this.newSection.style,
                    '',
                    this.newSection.difficulty,
                    this.newSection.steps,
                    ...processedContent,
                    ';'
                ];

                // Insert the new content
                const newLines = [...lines];
                newLines.splice(insertInfo.startIndex, 0, ...newSectionContent);

                // Write the modified content back to the file
                const newContent = newLines.join('\n');
                await fs.writeFile(filePath, newContent, 'utf8');

                console.log(`Successfully inserted new Beginner content in: ${filePath}`);
            } else {
                console.log(`Could not find #ATTACKS:; to insert new Beginner content in: ${filePath}`);
            }

        } catch (error) {
            console.error(`Error inserting Beginner content in ${filePath}: ${error.message}`);
        }
    }
}

module.exports = SmProcessor; 