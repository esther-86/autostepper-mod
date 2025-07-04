const fs = require('fs-extra');

/**
 * Class to process .sm files and modify specific sections
 */
class SmProcessor {
    constructor() {
        this.targetSection = {
            style: 'dance-single:',
            difficulty: 'Beginner:',
            steps: '2:'
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
        console.log('=== Section Content ===');
        lines.forEach((line, index) => {
            console.log(`${index + 1}: ${line}`);
        });
        console.log('======================');
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
            sections.forEach(section => {
                if (section.type === 'notes') {
                    this.extractBeginnerFromSection(section);
                }
            });

        } catch (error) {
            console.error(`Error extracting Beginner content from ${filePath}: ${error.message}`);
        }
    }

    /**
     * Extract Beginner content from a notes section
     * @param {Object} section - The section object
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

                        // Print the extracted content
                        if (beginnerContent.length > 0) {
                            console.log('\n=== Beginner Content Extracted ===');
                            console.log('Beginner: 2:');
                            beginnerContent.forEach(contentLine => {
                                console.log(contentLine);
                            });
                            console.log('================================\n');
                        }
                        continue;
                    }

                    // Add line to beginner content (skip the "2:" line)
                    if (trimmed !== '2:') {
                        beginnerContent.push(line);
                    }
                }
            }
        }

        // If we found Beginner but didn't hit next difficulty, print what we have
        if (foundBeginner && beginnerContent.length > 0) {
            console.log('\n=== Beginner Content Extracted ===');
            console.log('Beginner: 2:');
            beginnerContent.forEach(contentLine => {
                console.log(contentLine);
            });
            console.log('================================\n');
        }
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
}

module.exports = SmProcessor; 