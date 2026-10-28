import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import TaskForm from './TaskForm';
import useAuth from '../auth/useAuth';
import { Typography, CircularProgress, Box, Button } from '@mui/material';

export default function EditTaskPage({ onUpdate }) {
  const { taskId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(location.state?.taskData || null);
  const [loading, setLoading] = useState(!location.state?.taskData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!task) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`/tasks/${taskId}`);
          setTask(response.data.data);
        } catch (err) {
          setError(err.response?.data?.error || 'Failed to load task');
        } finally {
          setLoading(false);
        }
      };
      fetchTask();
    }
  }, [taskId, task]);

  const handleSubmit = async (formData) => {
    try {
      const response = await api.put(`/tasks/${task._id}`, formData);
      
      // Update the UI state instantly if the parent passed the handler
      if (onUpdate) onUpdate(response.data.data);
      setTimeout(() => {
        navigate(location.state?.from || '/tasks');
      }, 1500);
      
    } catch (err) {
      console.error('Update error:', err);
      setError(err.response?.data?.error || 'Failed to update task');
      throw err; 
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={6}><CircularProgress /></Box>;
  
  if (error && !task) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error" variant="h6">{error}</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Task not found</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  const requesterId = task.requester?._id || task.requester || task.createdBy?._id || task.createdBy;
  const isOwner = user?._id === requesterId;
  const isAdmin = user?.role === 'admin';

  if (!isOwner && !isAdmin) {
    return (
      <Box p={4} textAlign="center">
        <Typography color="error" variant="h6">You don't have permission to edit this task</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
      </Box>
    );
  }

  return (
    <Box p={2}>
      <TaskForm 
        initialValues={{
          title: task.title,
          description: task.description,
          category: task.category,
          location: task.location || { type: 'Point', coordinates: [0, 0], address: '' },
          deadline: task.deadline ? new Date(task.deadline) : null
        }}
        onSubmit={handleSubmit} 
        onCancel={() => navigate(-1)}
        isEdit={true}
      />
    </Box>
  );
}
