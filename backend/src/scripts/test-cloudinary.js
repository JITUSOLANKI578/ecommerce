const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testCloudinary() {
  console.log('Testing Cloudinary connectivity...');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');

  try {
    // Test authentication by getting account usage
    const usage = await cloudinary.api.usage();
    console.log('✓ Cloudinary authentication successful');
    console.log('Account usage:', {
      plan: usage.plan,
      resources: usage.resources,
      storage: usage.storage,
      bandwidth: usage.bandwidth
    });

    // Test folder existence
    console.log('\nTesting folder existence...');
    const foldersToTest = ['assets', 'images', 'products', 'categories'];

    for (const folder of foldersToTest) {
      try {
        const result = await cloudinary.api.root_folders();
        const folderExists = result.folders.some(f => f.name === folder);

        if (folderExists) {
          console.log(`✓ Folder "${folder}" exists`);

          // Test if folder has images
          try {
            const searchResult = await cloudinary.search
              .expression(`folder:${folder}/*`)
              .max_results(1)
              .execute();

            console.log(`  Images found: ${searchResult.resources.length}`);
            if (searchResult.resources.length > 0) {
              console.log(`  Sample image: ${searchResult.resources[0].public_id}`);
            }
          } catch (searchError) {
            console.log(`  No images found in "${folder}" folder`);
          }
        } else {
          console.log(`✗ Folder "${folder}" does not exist`);
        }
      } catch (folderError) {
        console.log(`✗ Error checking folder "${folder}":`, folderError.message);
      }
    }

    // Test search functionality
    console.log('\nTesting search functionality...');
    const testExpressions = [
      'folder:assets/*',
      'folder:images/*',
      'folder=assets OR folder:assets/*',
      'folder=images OR folder:images/*'
    ];

    for (const expression of testExpressions) {
      try {
        const result = await cloudinary.search
          .expression(expression)
          .max_results(5)
          .execute();

        console.log(`Expression: "${expression}"`);
        console.log(`  Results: ${result.resources.length} images`);
        if (result.resources.length > 0) {
          console.log(`  First image: ${result.resources[0].public_id}`);
        }
      } catch (searchError) {
        console.log(`Expression: "${expression}" - Error: ${searchError.message}`);
      }
    }

  } catch (error) {
    console.error('✗ Cloudinary test failed:', error.message);
    if (error.message.includes('401')) {
      console.error('Please check your Cloudinary API credentials in the .env file');
    }
  }
}

testCloudinary().catch(console.error);
