import { useEffect, useState } from "react";
import api from "../../lib/api";
import TaskCard from "./TaskCard";
import useAuth from "../auth/useAuth";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Pagination,
  Stack,
  Paper,
  TextField,
  MenuItem,
  InputAdornment,
  Grid
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

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  
  // Debounce State 
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); 
    }, 500);

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Main Fetch Effect
  useEffect(() => {
    loadTasks();
  }, [location.key, user, tabValue, page, debouncedSearch, category]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      let statusParam = "";
      if (tabValue === 0) statusParam = "open";
      if (tabValue === 1) statusParam = "claimed";
      if (tabValue === 2) statusParam = "completed";

      // Build endpoint with all filters
      let endpoint = `/tasks?page=${page}&limit=12&status=${statusParam}`; 
      
      if (user?.role === 'admin') endpoint += "&admin=true";
      if (category !== 'all') endpoint += `&category=${category}`;
      if (debouncedSearch) endpoint += `&search=${encodeURIComponent(debouncedSearch)}`;

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
    setTasks((prev) =>
      prev.map((t) =>
        t._id === updatedTask._id
          ? { ...updatedTask, helper: updatedTask.helper || t.helper }
          : t
      )
    );
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1); 
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
        {user?.role === 'admin' ? 'All System Tasks (Admin)' : 'Task Dashboard'}
      </Typography>

      {/* SEARCH AND FILTER BAR */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search tasks by title or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          size="small"
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
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
      </Stack>

      <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Open Tasks" />
          <Tab label="Claimed Tasks" />
          <Tab label="Completed" />
        </Tabs>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && tasks.length === 0 ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : tasks.length > 0 ? (
        // GRID LAYOUT: Uses MUI Grid for rows
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task._id}>
              <TaskCard
                task={task}
                onClaim={handleTaskUpdated}
                onUpdate={handleTaskUpdated}
                onDelete={handleTaskDeleted}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or category filters.
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)} 
            color="primary" 
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}
