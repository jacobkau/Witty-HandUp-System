import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import ChatBox from "./ChatBox";
import {
  Button, Card, CardContent, Typography, Chip, Stack, Box, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Avatar, Link, Badge, Divider
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon, 
  Pending as PendingIcon, 
  AssignmentInd as AssignmentIndIcon, 
  Event as EventIcon, 
  MoreVert as MoreVertIcon, 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  Email as EmailIcon, 
  Done as DoneIcon,
  Map as MapIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
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
  
  const [showMap, setShowMap] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [isRated, setIsRated] = useState(task?.isRated || false);

  const requesterId = task?.requester?._id || task?.createdBy?._id || task?.createdBy;
  const isCreator = user?._id === requesterId;
  const isClaimer = user?._id === task?.helper?._id;
  const isAdmin = user?.role === 'admin';
  
  const isCompleted = task?.status === "completed";
  const isClaimed = task?.status === "claimed";
  
  const canClaim = !isCreator && !isAdmin && task?.status === "open" && !isClaimer;

  // ---------------------------------------------------------
  // MAP COORDINATE ISOLATION
  // ---------------------------------------------------------
  // Destructure safely. Mongo stores [Lng, Lat].
  const lng = task?.location?.coordinates?.[0] || 0;
  const lat = task?.location?.coordinates?.[1] || 0;
  
  // Check if the location is actually valid (not 0,0)
  const hasValidLocation = lng !== 0 && lat !== 0;

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

  const handleRateTask = async () => {
    if (ratingValue < 1 || ratingValue > 5) return;
    setIsProcessing(true);
    try {
      await api.post(`/tasks/${task._id}/rate`, { rating: ratingValue });
      setIsRated(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit rating");
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
    <Card sx={{ mb: 2, border: '1px solid', borderColor: isAdmin ? 'secondary.light' : 'divider', boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
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

            <Typography variant="body2" color="text.secondary" mb={2} sx={{ whiteSpace: 'pre-wrap' }}>
              {task.description || "No description provided"}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight="bold">CREATOR</Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'primary.main' }}>
                    {task.requester?.name?.charAt(0) || "U"}
                  </Avatar>
                  <Typography variant="body2" fontWeight="medium">{task.requester?.name || "Unknown"}</Typography>
                </Stack>
              </Box>

              {isClaimed && task.helper && (
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">HELPER</Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 12, bgcolor: 'info.main' }}>
                      {task.helper?.name?.charAt(0) || "H"}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">{task.helper.name}</Typography>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {(isCreator || isAdmin) && (
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          )}
        </Stack>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={handleEdit} disabled={isProcessing || isCompleted}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit Task
          </MenuItem>
          <MenuItem onClick={handleDeleteClick} disabled={isProcessing} sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete Task
          </MenuItem>
        </Menu>

        <Box sx={{ mt: 2 }}>
          {canClaim ? (
            <Button variant="contained" size="medium" onClick={handleClaim} fullWidth disabled={isProcessing} startIcon={<AssignmentIndIcon />} disableElevation>Claim Task</Button>
          ) : isClaimer && !isCompleted ? (
            <Button variant="contained" size="medium" onClick={handleComplete} fullWidth color="success" disabled={isProcessing} startIcon={<DoneIcon />} disableElevation>Mark as Complete</Button>
          ) : null}
        </Box>

        {/* MAP SECTION */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small" 
            startIcon={<MapIcon />} 
            onClick={() => setShowMap(!showMap)}
            disabled={!hasValidLocation}
          >
            {!hasValidLocation ? "No Location Set" : showMap ? "Hide Map" : "View Location & Directions"}
          </Button>

          {showMap && hasValidLocation && (
            <Box sx={{ mt: 2, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              {/* Notice the order: lat first, then lng for Google Maps */}
              <iframe
                width="100%"
                height="250"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                allowFullScreen
                title="Task Location"
              ></iframe>
              
              <Box sx={{ p: 1.5, bgcolor: 'grey.50', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">{task.location.address || "Location pinned"}</Typography>
                
                {/* Directions also require lat, then lng */}
                <Link 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  underline="hover"
                  sx={{ fontSize: '0.875rem', fontWeight: 'bold' }}
                >
                  Get Directions ↗
                </Link>
              </Box>
            </Box>
          )}
        </Box>

        {/* RATINGS SECTION */}
        {isCompleted && isCreator && !isRated && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.50', borderRadius: 2, border: '1px dashed #ffb74d' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Rate the Helper: {task.helper?.name}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton key={star} onClick={() => setRatingValue(star)} color={ratingValue >= star ? "warning" : "default"}>
                  {ratingValue >= star ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
              ))}
              <Button variant="contained" color="warning" onClick={handleRateTask} disabled={ratingValue === 0 || isProcessing} sx={{ ml: 2 }} disableElevation>Submit</Button>
            </Stack>
          </Box>
        )}

        {/* CHAT SECTION */}
        {(isClaimed || isCompleted) && (isCreator || isClaimer || isAdmin) && (
          <Box mt={3}><ChatBox taskId={task._id} /></Box>
        )}

      </CardContent>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this task?</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isProcessing}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
