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
} from "@mui/material";
import { useLocation } from "react-router-dom";

export default function TaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const location = useLocation();

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTasks();
  }, [location.key, user, tabValue, page]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Determine status based on active tab
      let statusParam = "";
      if (tabValue === 0) statusParam = "open";
      if (tabValue === 1) statusParam = "claimed";
      if (tabValue === 2) statusParam = "completed";

      // Build endpoint
      let endpoint = `/tasks?page=${page}&limit=10&status=${statusParam}`;
      if (user?.role === 'admin') endpoint += "&admin=true";

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

  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
        {user?.role === 'admin' ? 'All System Tasks (Admin)' : 'Task Dashboard'}
      </Typography>

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

      {tasks.length > 0 ? (
        <Stack spacing={2}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClaim={handleTaskUpdated}
              onUpdate={handleTaskUpdated}
              onDelete={handleTaskDeleted}
            />
          ))}
        </Stack>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? "There are currently no open tasks available." : 
             tabValue === 1 ? "No tasks have been claimed yet." : 
             "No completed tasks to show."}
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
