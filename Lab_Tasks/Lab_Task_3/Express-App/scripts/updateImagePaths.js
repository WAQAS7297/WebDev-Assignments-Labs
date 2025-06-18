const mongoose = require('mongoose');
const BreadProduct = require('../models/breadProduct');

mongoose.connect('mongodb://127.0.0.1:27017/Tehzeeb_Bakers')
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            // Update image paths based on category
            const categoryFolderMap = {
                'buns': 'BUN',
                'breakfast': 'BREAKFAST BREAD',
                'rusk': 'RUSK',
                'croissant': 'CROISSANT'
            };

            // Get all products
            const products = await BreadProduct.find();
            
            for (const product of products) {
                const folder = categoryFolderMap[product.category];
                if (folder) {
                    // Extract just the image name from the current path
                    const imageName = product.image.split('/').pop();
                    // Create new path with correct folder structure
                    const newPath = `/images/products/${folder}/${imageName}`;
                    
                    // Update the product
                    await BreadProduct.findByIdAndUpdate(product._id, {
                        image: newPath
                    });
                    console.log(`Updated image path for ${product.name} to ${newPath}`);
                }
            }
            
            console.log('All image paths updated successfully');
        } catch (error) {
            console.error('Error updating image paths:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('Could not connect to MongoDB:', err)); 