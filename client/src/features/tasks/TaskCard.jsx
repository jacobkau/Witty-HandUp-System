import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import {
  Button, Card, CardContent, Typography, Chip, Stack, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Avatar, Link, Badge, Divider
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon, Pending as PendingIcon, AssignmentInd as AssignmentIndIcon, Event as EventIcon, MoreVert as MoreVertIcon, Delete as DeleteIcon, Edit as EditIcon, Email as EmailIcon, Phone as PhoneIcon, Done as DoneIcon, AdminPanelSettings as AdminIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskCard({ task, onClaim, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // User identification
  const requesterId = task?.requester?._id || task?.createdBy?._id || task?.createdBy;
  const isCreator = user?._id === requesterId;
  const isClaimer = user?._id === task?.helper?._id;
  const isAdmin = user?.role === 'admin';
  
  const isCompleted = task?.status === "completed";
  const isClaimed = task?.status === "claimed";
  
  const canClaim = !isCreator && !isAdmin && task?.status === "open" && !isClaimer;

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleEdit = () => {
    handleMenuClose();
    navigate(`/tasks/edit/${task._id}`, {
      state: { taskData: task, from: window.location.pathname },
    });
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await api.delete(`/tasks/${task._id}`);
      if (onDelete) onDelete(task._id);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete task");
    } finally {
      setIsProcessing(false);
      setDeleteConfirmOpen(false);
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/tasks/${task._id}/claim`);
      if (onClaim) onClaim(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to claim task");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const response = await api.put(`/tasks/${task._id}/complete`);
      if (onUpdate) onUpdate(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to complete task");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusChip = () => {
    switch (task?.status) {
      case "completed":
        return <Chip icon={<CheckCircleIcon />} label="Completed" color="success" size="small" variant="outlined" />;
      case "claimed":
        return <Chip icon={<AssignmentIndIcon />} label={isClaimer ? "Claimed by you" : `Claimed by ${task.helper?.name || "helper"}`} color="info" size="small" variant="outlined" />;
      default:
        return <Chip icon={<PendingIcon />} label="Open" color="warning" size="small" variant="outlined" />;
    }
  };

  if (!task) return null;

  return (
    <Card sx={{ 
      mb: 2, 
      border: '1px solid', 
      borderColor: isAdmin ? 'secondary.light' : 'divider', 
      boxShadow: 1,
      '&:hover': { boxShadow: 3 } 
    }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            {error && <Typography color="error" variant="caption" sx={{ display: "block", mb: 1 }}>{error}</Typography>}

            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6" fontWeight="bold">
                {task.title || "Untitled Task"}
                {isCreator && <Badge color="primary" badgeContent="Yours" invisible={!isCreator} sx={{ ml: 1.5 }} />}
              </Typography>
              {getStatusChip()}
            </Stack>

            {task.category && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Category: {task.category}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description || "No description provided"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              {/* Creator Information */}
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">CREATOR</Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
                    {task.requester?.name?.charAt(0) || task.createdBy?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">
                    {task.requester?.name || task.createdBy?.name || "Unknown"}
                  </Typography>
                  {task.requester?.email && (
                    <Tooltip title="Email creator">
                      <Link href={`mailto:${task.requester.email}`} color="inherit" underline="hover">
                        <EmailIcon fontSize="small" />
                      </Link>
                    </Tooltip>
                  )}
                </Stack>
              </Box>

              {/* Claimer Information */}
              {isClaimed && task.helper && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">HELPER</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'info.main' }}>
                      {task.helper?.name?.charAt(0) || "H"}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {task.helper.name}
                    </Typography>
                    {task.helper?.email && (
                      <Tooltip title="Email helper">
                        <Link href={`mailto:${task.helper.email}`} color="inherit" underline="hover">
                          <EmailIcon fontSize="small" />
                        </Link>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              )}

              {/* Deadline */}
              {task.deadline && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">DEADLINE</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                    <EventIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {new Date(task.deadline).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Admin/Creator Menu */}
          {(isCreator || isAdmin) && (
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Stack>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleEdit} disabled={isProcessing || isCompleted}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            {isCompleted ? "Completed tasks can't be edited" : "Edit Task"}
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} disabled={isProcessing} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Task
          </MenuItem>
        </Menu>

        {/* Action Buttons */}
        <Box sx={{ mt: 2 }}>
          {canClaim ? (
            <Button variant="contained" size="medium" onClick={handleClaim} fullWidth disabled={isProcessing} startIcon={<AssignmentIndIcon />} disableElevation>
              {isProcessing ? "Processing..." : "Claim Task"}
            </Button>
          ) : isClaimer && !isCompleted ? (
            <Button variant="contained" size="medium" onClick={handleComplete} fullWidth color="success" disabled={isProcessing} startIcon={<DoneIcon />} disableElevation>
              {isProcessing ? "Processing..." : "Mark as Complete"}
            </Button>
          ) : null}
        </Box>
      </CardContent>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" startIcon={<DeleteIcon />} disabled={isProcessing} disableElevation>
            {isProcessing ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
