const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const supabase = require('../lib/supabase');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all lists for user
router.get('/', auth, async (req, res) => {
  try {
    const { data: lists, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('user_id', req.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch lists' });
    }

    res.json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new list
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;

    const { data: list, error } = await supabase
      .from('shopping_lists')
      .insert([
        {
          name,
          user_id: req.userId,
          total_price: 0
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to create list' });
    }

    res.status(201).json({ ...list, list_items: [] });
  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single list
router.get('/:id', auth, async (req, res) => {
  try {
    const { data: list, error } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update list name
router.put('/:id', auth, async (req, res) => {
  try {
    const { name } = req.body;

    const { data: list, error } = await supabase
      .from('shopping_lists')
      .update({ name, updated_at: new Date() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete list
router.delete('/:id', auth, async (req, res) => {
  try {
    // First, get all items to delete images from Cloudinary
    const { data: items, error: fetchError } = await supabase
      .from('list_items')
      .select('image_public_id')
      .eq('list_id', req.params.id);

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch items' });
    }

    // Delete images from Cloudinary
    for (const item of items) {
      if (item.image_public_id) {
        await cloudinary.uploader.destroy(item.image_public_id);
      }
    }

    // Delete the list (items will be cascade deleted)
    const { error } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) {
      return res.status(404).json({ message: 'List not found' });
    }

    res.json({ message: 'List deleted' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to list
router.post('/:id/items', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const listId = req.params.id;

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', req.userId)
      .single();

    if (listError || !list) {
      return res.status(404).json({ message: 'List not found' });
    }

    let imageUrl = '';
    let imagePublicId = '';

    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'shopping-list' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Insert item
    const { data: item, error: insertError } = await supabase
      .from('list_items')
      .insert([
        {
          list_id: listId,
          name,
          price: parseFloat(price),
          image_url: imageUrl,
          image_public_id: imagePublicId
        }
      ])
      .select()
      .single();

    if (insertError) {
      // If image was uploaded, clean it up
      if (imagePublicId) {
        await cloudinary.uploader.destroy(imagePublicId);
      }
      return res.status(500).json({ message: 'Failed to add item' });
    }

    // Fetch updated list with items
    const { data: updatedList, error: fetchError } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', listId)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch updated list' });
    }

    res.status(201).json(updatedList);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item
router.put('/:listId/items/:itemId', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, price } = req.body;
    const { listId, itemId } = req.params;

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', req.userId)
      .single();

    if (listError || !list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get current item
    const { data: currentItem, error: itemError } = await supabase
      .from('list_items')
      .select('*')
      .eq('id', itemId)
      .eq('list_id', listId)
      .single();

    if (itemError || !currentItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    let imageUrl = currentItem.image_url;
    let imagePublicId = currentItem.image_public_id;

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (currentItem.image_public_id) {
        await cloudinary.uploader.destroy(currentItem.image_public_id);
      }

      // Upload new image
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'shopping-list' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    // Update item
    const { error: updateError } = await supabase
      .from('list_items')
      .update({
        name,
        price: parseFloat(price),
        image_url: imageUrl,
        image_public_id: imagePublicId,
        updated_at: new Date()
      })
      .eq('id', itemId)
      .eq('list_id', listId);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update item' });
    }

    // Fetch updated list
    const { data: updatedList, error: fetchError } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', listId)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch updated list' });
    }

    res.json(updatedList);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete item
router.delete('/:listId/items/:itemId', auth, async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', req.userId)
      .single();

    if (listError || !list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get item to delete image
    const { data: item, error: itemError } = await supabase
      .from('list_items')
      .select('image_public_id')
      .eq('id', itemId)
      .eq('list_id', listId)
      .single();

    if (itemError) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Delete image from Cloudinary if exists
    if (item.image_public_id) {
      await cloudinary.uploader.destroy(item.image_public_id);
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from('list_items')
      .delete()
      .eq('id', itemId)
      .eq('list_id', listId);

    if (deleteError) {
      return res.status(500).json({ message: 'Failed to delete item' });
    }

    // Fetch updated list
    const { data: updatedList, error: fetchError } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', listId)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch updated list' });
    }

    res.json(updatedList);
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle item purchased status
router.patch('/:listId/items/:itemId/toggle', auth, async (req, res) => {
  try {
    const { listId, itemId } = req.params;

    // Verify list ownership
    const { data: list, error: listError } = await supabase
      .from('shopping_lists')
      .select('id')
      .eq('id', listId)
      .eq('user_id', req.userId)
      .single();

    if (listError || !list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get current purchased status
    const { data: item, error: itemError } = await supabase
      .from('list_items')
      .select('purchased')
      .eq('id', itemId)
      .eq('list_id', listId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Toggle status
    const { error: updateError } = await supabase
      .from('list_items')
      .update({ purchased: !item.purchased })
      .eq('id', itemId)
      .eq('list_id', listId);

    if (updateError) {
      return res.status(500).json({ message: 'Failed to update item' });
    }

    // Fetch updated list
    const { data: updatedList, error: fetchError } = await supabase
      .from('shopping_lists')
      .select(`
        *,
        list_items (*)
      `)
      .eq('id', listId)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: 'Failed to fetch updated list' });
    }

    res.json(updatedList);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;