document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const promptInput = document.getElementById('promptInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const result = document.getElementById('result');
    const codeResult = document.getElementById('codeResult');
    let selectedFile = null;

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    // File input handler
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Handle file selection
    function handleFile(file) {
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            const reader = new FileReader();
            
            reader.onload = (e) => {
                preview.style.display = 'block';
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                analyzeBtn.disabled = false;
            };
            
            reader.readAsDataURL(file);
        } else {
            alert('Please select a valid image file');
        }
    }

    // Function to detect and format code blocks
    function formatResponse(text) {
        // Regular expression to match code blocks
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        let formattedText = text;
        let codeBlocks = [];
        let match;
        let index = 0;

        // Find all code blocks
        while ((match = codeBlockRegex.exec(text)) !== null) {
            const language = match[1] || 'javascript';
            const code = match[2].trim();
            const placeholder = `__CODE_BLOCK_${index}__`;
            codeBlocks.push({ language, code });
            formattedText = formattedText.replace(match[0], placeholder);
            index++;
        }

        return { text: formattedText, codeBlocks };
    }

    // Function to format text with proper HTML structure
    function formatText(text) {
        // Split text into paragraphs
        let paragraphs = text.split('\n\n');
        let formattedHTML = '';

        paragraphs.forEach(paragraph => {
            // Skip empty paragraphs
            if (!paragraph.trim()) return;

            // Check for title (text ending with :)
            if (paragraph.trim().endsWith(':')) {
                formattedHTML += `<h3>${paragraph.trim()}</h3>`;
                return;
            }

            // Check for description (text starting with - or •)
            if (paragraph.trim().startsWith('-') || paragraph.trim().startsWith('•')) {
                formattedHTML += `<p class="description">${paragraph.trim().substring(1).trim()}</p>`;
                return;
            }

            // Check for lists
            if (paragraph.includes('\n-') || paragraph.includes('\n•')) {
                let listItems = paragraph.split('\n').filter(item => item.trim().startsWith('-') || item.trim().startsWith('•'));
                if (listItems.length > 0) {
                    formattedHTML += '<ul>';
                    listItems.forEach(item => {
                        formattedHTML += `<li>${item.trim().substring(1).trim()}</li>`;
                    });
                    formattedHTML += '</ul>';
                    return;
                }
            }

            // Regular paragraph
            formattedHTML += `<p>${paragraph.trim()}</p>`;
        });

        return formattedHTML;
    }

    // Analyze button click handler
    analyzeBtn.addEventListener('click', async () => {
        if (!selectedFile || !promptInput.value.trim()) {
            alert('Please select an image and enter a prompt');
            return;
        }

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';
        result.innerHTML = '<p class="placeholder">Analyzing image...</p>';
        codeResult.style.display = 'none';

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            formData.append('prompt', promptInput.value);

            const response = await fetch('/api/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();
            const formattedResponse = formatResponse(data.result);

            // Display the formatted text part
            result.innerHTML = formatText(formattedResponse.text);

            // Display code blocks if any
            if (formattedResponse.codeBlocks.length > 0) {
                displayCodeSnippet(formattedResponse.codeBlocks[0].code);
            }
        } catch (error) {
            result.innerHTML = `<p class="error">Error: ${error.message}</p>`;
            codeResult.style.display = 'none';
        } finally {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Image';
        }
    });

    function copyCode() {
        const codeElement = document.querySelector('#codeResult pre code');
        if (codeElement && codeElement.textContent.trim() !== '') {
            const codeText = codeElement.textContent;

            // Copy the code text to the clipboard
            navigator.clipboard.writeText(codeText).then(() => {
                const copyButton = document.querySelector('.copy-btn .copy-text');
                copyButton.textContent = 'Copied!';
                
                // Reset the button text after 2 seconds
                setTimeout(() => {
                    copyButton.textContent = 'Copy Code';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy code: ', err);
            });
        } else {
            alert('No code snippet available to copy.');
        }
    }

    function displayCodeSnippet(code) {
        const codeContainer = document.querySelector('#codeResult');
        const codeElement = codeContainer.querySelector('pre code');
        
        // Update the code snippet
        codeElement.textContent = code;
    
        // Show the code container
        codeContainer.style.display = 'block';
    
        // Re-highlight the code using Prism.js
        Prism.highlightElement(codeElement);
    }

});