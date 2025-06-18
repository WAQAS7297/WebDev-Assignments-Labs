const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');
const Carousel = require('../models/Carosel.model');

// Create assets_carousel directory if it doesn't exist
const assetDir = path.join(__dirname, '../public/images/assets_carousel');
if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
}

// Function to download image
const downloadImage = (imageUrl, filename) => {
    return new Promise((resolve, reject) => {
        const filepath = path.join(assetDir, filename);
        
        // Skip if file already exists
        if (fs.existsSync(filepath)) {
            console.log(`File ${filename} already exists, skipping...`);
            return resolve();
        }

        // Parse URL to determine protocol
        const parsedUrl = url.parse(imageUrl);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;

        const options = {
            ...parsedUrl,
            rejectUnauthorized: false, // Allow self-signed certificates
            timeout: 5000 // 5 second timeout
        };

        protocol.get(options, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirects
                console.log(`Redirecting to: ${response.headers.location}`);
                return downloadImage(response.headers.location, filename)
                    .then(resolve)
                    .catch(reject);
            }

            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to download ${imageUrl}: ${response.statusCode}`));
            }

            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(filepath, () => reject(err));
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${imageUrl}:`, err.message);
            reject(err);
        }).on('timeout', () => {
            console.error(`Timeout downloading ${imageUrl}`);
            reject(new Error('Request timed out'));
        });
    });
};

// Function to safely download with retries
const safeDownload = async (url, filename, retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            await downloadImage(url, filename);
            return;
        } catch (error) {
            console.error(`Attempt ${i + 1}/${retries} failed for ${filename}:`, error.message);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        }
    }
};

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Tehzeeb_Bakers')
    .then(async () => {
        console.log('Connected to database');
        try {
            // Get carousel items
            const carouselItems = await Carousel.find();
            console.log(`Found ${carouselItems.length} carousel items`);

            // Download carousel images
            for (const carousel of carouselItems) {
                // Extract original filename from URL or use index
                const originalFilename = path.basename(carousel.imageUrl || '');
                if (!carousel.imageUrl) {
                    console.error('No image URL found for carousel item:', carousel);
                    continue;
                }
                
                const filename = `carousel_${originalFilename}`;
                
                try {
                    await safeDownload(carousel.imageUrl, filename);
                    console.log(`Successfully downloaded: ${filename}`);
                } catch (error) {
                    console.error(`Failed to download carousel image (${filename}):`, error.message);
                }
            }

            console.log('Carousel images download process completed!');
        } catch (error) {
            console.error('Error during download process:', error);
        } finally {
            await mongoose.disconnect();
            console.log('Disconnected from database');
        }
    })
    .catch(err => {
        console.error('Database connection error:', err);
    }); 