import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ImageGallery from '../components/Images/ImageGallery';
import { useImages } from '../hooks/useImages';

const ImageGalleryPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  
  const { categories } = useImages();
  
  const currentCategory = categories.find(cat => 
    cat.name.toLowerCase() === category?.toLowerCase()
  );

  const handleImageSelect = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Image Gallery
            </h1>
            <p className="text-gray-600">
              Please select a category to view images.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <ImageGallery
          category={category}
          title={currentCategory?.displayName || category}
          showSearch={true}
          showFilters={true}
          itemsPerPage={24}
          multiSelect={true}
          selectedImages={selectedImages}
          onImageSelect={(image) => handleImageSelect(image.id)}
        />
      </div>
    </div>
  );
};

export default ImageGalleryPage;