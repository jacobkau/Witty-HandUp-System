import { useEffect, useState } from "react";
import api from "../../lib/api";
import TaskCard from "./TaskCard";
import useAuth from "../auth/useAuth";
import {
  Box, Typography, CircularProgress, Alert, Tabs, Tab, Pagination,
  Stack, Paper, TextField, MenuItem, InputAdornment, FormControlLabel, Switch
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { useLocation } from "react-router-dom";

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  useEffect(() => {
    loadTasks();
  }, [location.key, user, tabValue, page, debouncedSearch, category, showMine]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      let endpoint = `/tasks?page=${page}&limit=12`;
      
      if (tabValue === 0) {
        endpoint += "&status=open";
      } else if (tabValue === 1) {
        endpoint += "&status=claimed"; 
      } else if (tabValue === 2) {
        endpoint += "&status=completed";
      } else if (tabValue === 3) {
        endpoint += "&bidsOnly=true"; 
      }
      
      if (user?.role === 'admin') endpoint += "&admin=true";
      if (category !== 'all') endpoint += `&category=${category}`;
      if (debouncedSearch) endpoint += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (showMine && user) endpoint += "&mine=true";

      const res = await api.get(endpoint);
      setTasks(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) => prev.map((t) => t._id === updatedTask._id ? { ...updatedTask, helper: updatedTask.helper || t.helper } : t));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); 
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
        {user?.role === 'admin' ? 'All System Tasks (Admin)' : 'Task Dashboard'}
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3} alignItems="center">
        <TextField
          fullWidth size="small" placeholder="Search tasks..." value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
        />
        <TextField
          select size="small" label="Category" value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="all">All Categories</MenuItem>
          <MenuItem value="errands">Errands</MenuItem>
          <MenuItem value="repairs">Repairs</MenuItem>
          <MenuItem value="education">Education</MenuItem>
          <MenuItem value="donations">Donations</MenuItem>
          <MenuItem value="cleaning">Cleaning</MenuItem>
          <MenuItem value="tech">Tech Support</MenuItem>
          <MenuItem value="delivery">Delivery</MenuItem>
          <MenuItem value="events">Events</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>

        {user && (
          <FormControlLabel
            control={<Switch checked={showMine} onChange={(e) => { setShowMine(e.target.checked); setPage(1); }} color="primary" />}
            label="Show my tasks"
            sx={{ whiteSpace: 'nowrap' }}
          />
        )}
      </Stack>

      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary">
          <Tab label="Open Tasks" />
          <Tab label="In Progress" />
          <Tab label="Completed" />
          {user && <Tab label="My Bids" />}
        </Tabs>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && tasks.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : tasks.length > 0 ? (
        
        <Box 
          display="grid" 
          gridTemplateColumns={{ 
            xs: '1fr',          
            sm: 'repeat(2, 1fr)',  
            md: 'repeat(3, 1fr)'     
          }} 
          gap={3}
        >
          {tasks.map((task) => (
            <Box key={task._id} sx={{ height: '100%' }}>
              <TaskCard
                task={task}
                onClaim={handleTaskUpdated}
                onUpdate={handleTaskUpdated}
                onDelete={handleTaskDeleted}
              />
            </Box>
          ))}
        </Box>

      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>No tasks found</Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 3 ? "You haven't placed any bids yet." : "Try adjusting your search terms or category filters."}
          </Typography>
        </Box>
      )}

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" size="large" />
        </Box>
      )}
    </Box>
  );
}
