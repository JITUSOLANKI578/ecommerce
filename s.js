const express = require('express');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');

const app = express();

// ✅ CORS should be used only once — this is sufficient:
app.use(cors({
  origin: '*', // allow all origins (development only)
}));

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: 'dqawfzocy',
  api_key: '411862527954198',
  api_secret: '_1YOvPonH03V3moFTIWNNMDJbos',
});

// ✅ Route for fetching images
app.get('/images', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: 'image',
      max_results: 100,
    });
    res.json(result.resources);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).send('Error fetching images');
  }
});

// ✅ Route for fetching videos (from 'videos' folder)
app.get('/videos', async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:videos')
      .sort_by('public_id','desc')
      .max_results(100)
      .execute();

    console.log('Cloudinary search result:', result.resources);
    res.json(result.resources);
  } catch (err) {
    console.error('Error fetching videos via search:', err);
    res.status(500).send('Error fetching videos');
  }
});



// ✅ Start server
const PORT = 1212;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
