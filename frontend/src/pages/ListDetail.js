import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Container,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ShoppingCart as ShoppingCartIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';

function ListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API_URL } = useAuth();
  const [list, setList] = useState(null);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchList();
  }, [id]);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/lists/${id}`);
      setList(response.data);
    } catch (error) {
      toast.error('Failed to fetch list');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setItemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async () => {
    if (!itemName || !itemPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(itemPrice) < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('price', parseFloat(itemPrice));
    if (itemImage) {
      formData.append('image', itemImage);
    }

    try {
      const response = await axios.post(
        `${API_URL}/lists/${id}/items`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setList(response.data);
      resetItemForm();
      setOpenItemDialog(false);
      toast.success('Item added successfully');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async () => {
    if (!itemName || !itemPrice) {
      toast.error('Please fill in all fields');
      return;
    }

    if (parseFloat(itemPrice) < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    const formData = new FormData();
    formData.append('name', itemName);
    formData.append('price', parseFloat(itemPrice));
    if (itemImage) {
      formData.append('image', itemImage);
    }

    try {
      const response = await axios.put(
        `${API_URL}/lists/${id}/items/${editingItem.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setList(response.data);
      resetItemForm();
      setEditingItem(null);
      setOpenItemDialog(false);
      toast.success('Item updated successfully');
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await axios.delete(
          `${API_URL}/lists/${id}/items/${itemId}`
        );
        setList(response.data);
        toast.success('Item deleted successfully');
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const handleTogglePurchased = async (itemId) => {
    try {
      const response = await axios.patch(
        `${API_URL}/lists/${id}/items/${itemId}/toggle`
      );
      setList(response.data);
    } catch (error) {
      toast.error('Failed to update item status');
    }
  };

  const resetItemForm = () => {
    setItemName('');
    setItemPrice('');
    setItemImage(null);
    setImagePreview('');
  };

  const openEditItemDialog = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemPrice(item.price.toString());
    setImagePreview(item.image_url || '');
    setOpenItemDialog(true);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!list) {
    return null;
  }

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {list.name}
          </Typography>
          <Chip
            label={`Total: $${list.total_price?.toFixed(2) || '0.00'}`}
            sx={{ 
              backgroundColor: 'white',
              color: '#1976d2',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Items
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetItemForm();
              setEditingItem(null);
              setOpenItemDialog(true);
            }}
            sx={{ 
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            Add Item
          </Button>
        </Box>

        {list.list_items?.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 8,
              backgroundColor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed #ccc'
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" color="textSecondary" gutterBottom>
              No items in this list
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Add your first item to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetItemForm();
                setEditingItem(null);
                setOpenItemDialog(true);
              }}
            >
              Add Item
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {list.list_items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: item.purchased ? 0.8 : 1,
                  backgroundColor: item.purchased ? '#f8f8f8' : 'white',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}>
                  {item.image_url && (
                    <CardMedia
                      component="img"
                      height="160"
                      image={item.image_url}
                      alt={item.name}
                      sx={{ 
                        objectFit: 'cover',
                        borderBottom: '1px solid #eee'
                      }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                      </Typography>
                      <Chip
                        label={`$${item.price.toFixed(2)}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                    
                    {item.purchased && (
                      <Chip
                        label="Purchased"
                        color="success"
                        size="small"
                        icon={<ShoppingCartIcon />}
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant={item.purchased ? "contained" : "outlined"}
                        color={item.purchased ? "success" : "primary"}
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleTogglePurchased(item.id)}
                        fullWidth
                        sx={{ mb: 1, textTransform: 'none' }}
                      >
                        {item.purchased ? 'Purchased' : 'Mark Purchased'}
                      </Button>
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => openEditItemDialog(item)}
                          sx={{ flex: 1, textTransform: 'none' }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ flex: 1, textTransform: 'none' }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Add/Edit Item Dialog */}
      <Dialog 
        open={openItemDialog} 
        onClose={() => {
          setOpenItemDialog(false);
          setEditingItem(null);
          resetItemForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            variant="outlined"
            placeholder="e.g., Apples, Milk, Bread"
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Price ($)"
            type="number"
            fullWidth
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            variant="outlined"
            required
            inputProps={{ step: '0.01', min: '0' }}
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCameraIcon />}
            sx={{ mt: 1, mb: 2 }}
            fullWidth
          >
            {itemImage || imagePreview ? 'Change Image' : 'Upload Image'}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </Button>
          
          {imagePreview && (
            <Box sx={{ mt: 2, textAlign: 'center', position: 'relative' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '200px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  setItemImage(null);
                  setImagePreview('');
                }}
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'white',
                  '&:hover': { backgroundColor: '#ffebee' }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setOpenItemDialog(false);
              setEditingItem(null);
              resetItemForm();
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={editingItem ? handleUpdateItem : handleAddItem}
            variant="contained"
            disabled={!itemName || !itemPrice}
          >
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <IconButton
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          backgroundColor: '#1976d2',
          color: 'white',
          '&:hover': { backgroundColor: '#1565c0' },
          display: { xs: 'flex', sm: 'none' },
          width: 56,
          height: 56
        }}
        onClick={() => {
          resetItemForm();
          setEditingItem(null);
          setOpenItemDialog(true);
        }}
      >
        <AddIcon />
      </IconButton>
    </>
  );
}

export default ListDetail;