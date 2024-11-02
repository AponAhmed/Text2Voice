// frontend/src/main.js

import './styles.css'; // Adjust path if necessary

const listSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-white" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M160 144h288M160 256h288M160 368h288" /><circle cx="80" cy="144" r="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />                    <circle cx="80" cy="256" r="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" />                    <circle cx="80" cy="368" r="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" /></svg>`;
const backSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-white" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" d="M244 400L100 256l144-144M120 256h292"/></svg>`;
const downSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-white" viewBox="0 0 512 512"><path d="M336 176h40a40 40 0 0140 40v208a40 40 0 01-40 40H136a40 40 0 01-40-40V216a40 40 0 0140-40h40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 272l80 80 80-80M256 48v288"/></svg>`;
const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-gray-800" viewBox="0 0 512 512"><path d="M112 111v290c0 17.44 17 28.52 31 20.16l247.9-148.37c12.12-7.25 12.12-26.33 0-33.58L143 90.84c-14-8.36-31 2.72-31 20.16z" fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32"/></svg>`;
const pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-gray-800" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 96h16v320h-16zM320 96h16v320h-16z"/></svg>`;
const delSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 text-gray-800" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 368L144 144M368 144L144 368"/></svg>`;
const appTitle = document.getElementById('apptitle');

const convertBtn = document.getElementById('convert-button');
convertBtn.addEventListener('click', async () => {

    convertBtn.innerHTML = `<div class="loader">
  <span></span>
</div> Converting...`;

    const text = document.getElementById('text-input').value;
    if (!text) {
        alert('Please enter some text!');
        return;
    }

    try {
        const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Error generating MP3');
        }

        convertBtn.innerHTML = "Completed successfully";
        setTimeout(() => {
            convertBtn.innerHTML = "Convert to MP3";
        }, 2000)

        const data = await response.json();
        const downloadLink = `<a class="px-2 bg-gradient-to-r from-sky-700 to-sky-900 text-white py-2 rounded-md hover:from-sky-800 hover:to-sky-600" href="/api/download/${data.filename}">${downSvg}</a>`;
        document.getElementById('result').innerHTML = downloadLink;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'Error generating MP3';
    }
});

// Function to show the generated file list
// main.js
document.addEventListener('DOMContentLoaded', () => {

    const showListButton = document.getElementById('show-list');
    const generateSection = document.getElementById('generate');
    const fileListSection = document.getElementById('file-list');
    const fileListDiv = document.getElementById('list-items');

    // Event listener for toggle button
    showListButton.addEventListener('click', () => {
        if (fileListSection.classList.contains('hidden')) {
            // Show file list and hide generate section
            fileListSection.classList.remove('hidden');
            generateSection.classList.add('hidden');
            showListButton.innerHTML = backSvg; // Change button text
            appTitle.innerHTML = 'Generated Files'; // Update app title
            // Fetch the list of files
            fetch('/api/files')
                .then(response => response.json())
                .then(files => {
                    files.sort((a, b) => b.localeCompare(a)); // Change this if you want a specific sorting logic

                    if (files.length > 0) {
                        fileListDiv.innerHTML = ''; // Clear previous list
                        files.forEach(file => {
                            const listItem = document.createElement('div');
                            listItem.className = 'flex items-center justify-between text-gray-800 p-2 bg-gray-200 rounded-md mb-2';

                            // Extract the timestamp and convert it to a human-readable format
                            const timestamp = parseInt(file.match(/-(\d+)\.mp3$/)[1]);
                            const createdAt = new Date(timestamp).toLocaleString(); // Format the date
                            // Create the buttons
                            const downloadButton = `<a href="/api/download/${file}" class="text-blue-500">${downSvg.replace('text-white', 'text-gray-800')}</a>`;
                            const playPauseButton = `<button class="play-pause-button text-blue-500" data-file="${file}">${playSvg}</button>`;
                            const deleteButton = `<button class="delete-button text-red-500" data-file="${file}">${delSvg}</button>`;

                            listItem.innerHTML = `<div class="flex flex-col">
                                <span class="text-sm text-gray-800">${file}</span>
                                <span class="text-gray-600 text-xs">${createdAt}</span>
                            </div>
                            <div class="flex space-x-2">
                                ${downloadButton}
                                ${playPauseButton}
                                ${deleteButton}
                            </div>
                        `;

                            // Append the list item to the file list container
                            fileListDiv.appendChild(listItem);

                            // Add event listeners for buttons
                            const playButton = listItem.querySelector('.play-pause-button');
                            playButton.addEventListener('click', function () {
                                const filename = this.dataset.file;
                                handlePlayPause(filename, this);
                            });

                            const deleteButtonElement = listItem.querySelector('.delete-button');
                            deleteButtonElement.addEventListener('click', function () {
                                const filename = this.dataset.file;
                                handleDelete(filename, listItem);
                            });
                        });
                    } else {
                        fileListDiv.innerHTML = "No files found";
                    }
                })
                .catch(error => {
                    fileListDiv.innerHTML = "An error occurred while fetching files: " + error.message;
                });


        } else {
            appTitle.innerHTML = 'Generate MP3 from Text'; // Update app title
            // Show generate section and hide file list
            fileListSection.classList.add('hidden');
            generateSection.classList.remove('hidden');
            showListButton.innerHTML = listSvg; // Change button icon back
        }
    });
});

//Existing File Handle

let audio = null; // Global audio variable to handle playback
let currentlyPlaying = ''; // Track currently playing file

function handlePlayPause(filename, button) {
    if (currentlyPlaying === filename && audio) {
        // Pause the audio if it's already playing
        if (!audio.paused) {
            audio.pause();
            button.innerHTML = playSvg;
        } else {
            audio.play();
            button.innerHTML = pauseSvg;
        }
    } else {
        // Stop current audio if playing a different file
        if (audio) {
            audio.pause();
        }
        audio = new Audio(`/api/download/${filename}`);
        audio.play();
        currentlyPlaying = filename;
        button.innerHTML = pauseSvg;
    }

    // Update button text when audio ends
    audio.onended = () => {
        button.innerHTML = playSvg;
        currentlyPlaying = '';
    };
}

function handleDelete(filename, listItem) {
    fetch(`/api/delete/${filename}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                listItem.remove(); // Remove the list item from the DOM
            } else {
                alert('Error deleting file');
            }
        })
        .catch(error => {
            alert('An error occurred while deleting the file: ' + error.message);
        });
}

