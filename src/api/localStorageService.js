export const localStorageService = {
  saveProduct: (productData) => {
    try {
      const products = JSON.parse(localStorage.getItem('products') || '[]')
      
      const newProduct = {
        _id: 'local_' + Date.now(),
        name: productData.name,
        description: productData.description,
        category: productData.category,
        price: productData.price,
        colour: productData.colour || '',
        specification: productData.specification || '',
        stockQuantity: productData.stockQuantity || 0,
        stockStatus: productData.stockStatus || 'InStock',
        brand: productData.brand || '',
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        images: productData.images ? productData.images.map((file, index) => ({
          url: URL.createObjectURL(file),
          public_id: `local_${Date.now()}_${index}`
        })) : [],
        createdAt: new Date().toISOString(),
        source: 'local'
      }
      
      products.push(newProduct)
      localStorage.setItem('products', JSON.stringify(products))
      
      return {
        message: 'Product saved locally (backend unavailable)',
        newProduct
      }
    } catch (error) {
      throw new Error('Failed to save product locally: ' + error.message)
    }
  },

  getProducts: () => {
    try {
      return JSON.parse(localStorage.getItem('products') || '[]')
    } catch (error) {
      return []
    }
  },

  clearProducts: () => {
    localStorage.removeItem('products')
  }
}
