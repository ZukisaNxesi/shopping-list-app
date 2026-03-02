import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Fab,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Logout as LogoutIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';

function Dashboard() {
  const [lists, setLists] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingList, setEditingList] = useState(null);
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get(`${API_URL}/lists`);
      setLists(response.data);
    } catch (error) {
      toast.error('Failed to fetch lists');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/lists`, {
        name: newListName
      });
      setLists([response.data, ...lists]);
      setOpenDialog(false);
      setNewListName('');
      toast.success('List created successfully');
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const handleUpdateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    try {
      const response = await axios.put(`${API_URL}/lists/${editingList.id}`, {
        name: newListName
      });
      setLists(lists.map(list => 
        list.id === editingList.id ? response.data : list
      ));
      setEditingList(null);
      setNewListName('');
      toast.success('List updated successfully');
    } catch (error) {
      toast.error('Failed to update list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/lists/${listId}`);
        setLists(lists.filter(list => list.id !== listId));
        toast.success('List deleted successfully');
      } catch (error) {
        toast.error('Failed to delete list');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openEditDialog = (list) => {
    setEditingList(list);
    setNewListName(list.name);
    setOpenDialog(true);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <ShoppingCartIcon sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Shopping Lists
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                {user?.username ? getInitials(user.username) : 'U'}
              </Avatar>
              <Typography variant="body1" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.username}
              </Typography>
            </Box>
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Logout
            </Button>
            <IconButton 
              color="inherit" 
              onClick={handleLogout}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            My Shopping Lists
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditingList(null);
              setNewListName('');
              setOpenDialog(true);
            }}
            sx={{ 
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            New List
          </Button>
        </Box>

        {lists.length === 0 ? (
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
              No shopping lists yet
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
              Create your first shopping list to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingList(null);
                setNewListName('');
                setOpenDialog(true);
              }}
            >
              Create New List
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {lists.map((list) => (
              <Grid item xs={12} sm={6} md={4} key={list.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {list.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography color="textSecondary">
                        Items: {list.list_items?.length || 0}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>
                        ${list.total_price?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => navigate(`/list/${list.id}`)}
                        fullWidth
                        sx={{ textTransform: 'none' }}
                      >
                        View Items
                      </Button>
                      <IconButton 
                        size="small" 
                        onClick={() => openEditDialog(list)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteList(list.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Create/Edit List Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          setOpenDialog(false);
          setEditingList(null);
          setNewListName('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {editingList ? 'Edit List' : 'Create New Shopping List'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="List Name"
            fullWidth
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            variant="outlined"
            placeholder="e.g., Weekly Groceries"
            required
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setOpenDialog(false);
              setEditingList(null);
              setNewListName('');
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={editingList ? handleUpdateList : handleCreateList}
            variant="contained"
            disabled={!newListName.trim()}
          >
            {editingList ? 'Update List' : 'Create List'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' }
        }}
        onClick={() => {
          setEditingList(null);
          setNewListName('');
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>
    </>
  );
}

export default Dashboard;