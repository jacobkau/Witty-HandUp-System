import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import ChatBox from "./ChatBox";
import { 
  Button, Card, CardContent, Typography, Chip, Stack, Box, Avatar, 
  Divider, TextField, Tooltip, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from "@mui/material";
import { 
  LocationOn, AccessTime, Star, Gavel, 
  Phone, Delete, Edit, Directions, Map as MapIcon,
  Chat as ChatIcon, Close as CloseIcon, Person as PersonIcon
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bidAmount, setBidAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isCreator = currentUserId === task?.requester?._id;
  const isHelper = currentUserId === task?.helper?._id;
  const isAdmin = user?.role === 'admin'; 
  const hasBid = task?.bids?.find(b => b.helper?._id === currentUserId);

  const lng = task?.location?.coordinates?.[0] || 0;
  const lat = task?.location?.coordinates?.[1] || 0;
  const hasValidLocation = lng !== 0 && lat !== 0;

  const handlePlaceBid = async () => {
    if (!bidAmount) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/tasks/${task._id}/bid`, { amount: Number(bidAmount), message: "I can do this!" });
      onUpdate(res.data.data);
      setBidAmount('');
    } catch (err) { 
      setError(err.response?.data?.error || "Bid failed"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleAcceptBid = async (bidId) => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/accept-bid`, { bidId });
      onUpdate(res.data.data);
    } catch (err) { 
      setError(err.response?.data?.error || "Failed to accept bid"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/complete`);
      onUpdate(res.data.data);
    } catch (err) { 
      setError(err.response?.data?.error || "Failed to complete"); 
    } finally { 
      setIsProcessing(false); 
    }
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

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      border: task.isUrgent ? '2px solid #d32f2f' : (isAdmin ? '2px dashed #9c27b0' : '1px solid #e0e0e0'), 
      boxShadow: 1,
      borderRadius: 2,
      '&:hover': { boxShadow: 3 }
    }}>
      {/* URGENT BANNER */}
      {task.isUrgent && (
        <Box sx={{ bgcolor: 'error.main', color: 'white', textAlign: 'center', py: 0.8, fontSize: '0.85rem', fontWeight: 'bold' }}>
           URGENT TASK
        </Box>
      )}
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        
        {/* HEADER: Title & Status */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>
            {task.title}
          </Typography>
          <Chip 
            label={task.status.toUpperCase()} 
            color={task.status === 'open' ? 'warning' : task.status === 'claimed' ? 'info' : 'success'} 
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Stack>

        {/* CHIPS: Price, Category, Date */}
        <Stack direction="row" spacing={1} mt={1.5} mb={2} flexWrap="wrap">
          <Chip label={`KES ${task.price}`} color="success" size="small" sx={{ fontWeight: 'bold' }} />
          <Chip label={task.category.toUpperCase()} size="small" variant="outlined" />
          <Chip icon={<AccessTime fontSize="small" />} label={new Date(task.createdAt).toLocaleDateString()} size="small" />
        </Stack>

        {/* EDIT/DELETE */}
        {(isCreator || isAdmin) && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" mb={1}>
            <Tooltip title="Edit Task">
              <IconButton size="small" onClick={() => navigate(`/tasks/edit/${task._id}`, { state: { taskData: task } })} disabled={task.status !== 'open'}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Task">
              <IconButton size="small" color="error" onClick={() => setDeleteConfirmOpen(true)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* DESCRIPTION */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flexGrow: 1 }}>
          {task.description}
        </Typography>

        {/* SMALL FIELDS IN ROWS */}
        <Stack spacing={1.5} mb={2.5}>
          {/* Location Row */}
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" noWrap>
              {task.location.address || "Coordinates pinned"}
            </Typography>
          </Stack>

          {/* Creator Row */}
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon fontSize="small" color="action" />
            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'primary.main' }}>
              {task.requester?.name?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Posted by {task.requester?.name}
            </Typography>
            {task.requester?.phone && (
              <Tooltip title="Call Creator">
                <IconButton size="small" href={`tel:${task.requester.phone}`} color="success" sx={{ p: 0.5 }}>
                  <Phone sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>

        {/* MAP & DIRECTIONS */}
        {hasValidLocation && (
          <Box mb={2.5}>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" startIcon={<MapIcon />} onClick={() => setShowMap(!showMap)} sx={{ textTransform: 'none' }}>
                {showMap ? "Hide Map" : "View Map"}
              </Button>
              <Button 
                variant="contained" size="small" color="secondary" startIcon={<Directions />}
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank" rel="noopener noreferrer" disableElevation
                sx={{ textTransform: 'none' }}
              >
                Directions
              </Button>
            </Stack>

            {showMap && (
              <Box sx={{ mt: 1.5, borderRadius: 2, overflow: 'hidden', border: '1px solid #e0e0e0' }}>
                <iframe
                  width="100%" height="150" frameBorder="0" style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${lat},${lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen title="Task Location"
                ></iframe>
              </Box>
            )}
          </Box>
        )}

        {/* BIDDING SECTION (OPEN) */}
        {task.status === 'open' && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
            {isCreator && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  <Gavel fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> 
                  Bids Received ({task.bids?.length || 0})
                </Typography>
                {task.bids?.length > 0 ? (
                  task.bids.map(b => (
                    <Box key={b._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{b.helper?.name?.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">{b.helper?.name}</Typography>
                          {b.helper?.numReviews > 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <Star style={{ color: '#fbbf24', fontSize: 12 }} />
                              <Typography variant="caption">{b.helper.rating.toFixed(1)}</Typography>
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight="bold" color="success.main" variant="body2">KES {b.amount}</Typography>
                        <Button size="small" variant="contained" onClick={() => handleAcceptBid(b._id)} disabled={isProcessing} disableElevation>
                          Accept
                        </Button>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">Waiting for helpers to bid...</Typography>
                )}
              </Box>
            )}

            {!isCreator && !hasBid && (
              <Stack direction="row" spacing={1}>
                <TextField 
                  size="small" type="number" placeholder="Enter amount" 
                  value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} fullWidth
                />
                <Button variant="contained" onClick={handlePlaceBid} disabled={isProcessing || !bidAmount} disableElevation>
                  Bid
                </Button>
              </Stack>
            )}
            
            {hasBid && (
              <Box sx={{ bgcolor: 'success.50', p: 1.5, borderRadius: 1, border: '1px solid #a5d6a7', textAlign: 'center' }}>
                <Typography variant="body2" color="success.main" fontWeight="bold">
                  ✓ Your bid of KES {hasBid.amount} is pending approval.
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* CLAIMED OR COMPLETED STATE */}
        {(task.status === 'claimed' || task.status === 'completed') && task.helper && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
            
            {/* Helper Info Row */}
            <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, mb: 2 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" textTransform="uppercase">
                Assigned Helper
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" mt={1}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'info.main' }}>
                  {task.helper?.name?.charAt(0)}
                </Avatar>
                <Box flexGrow={1}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight="bold">{task.helper?.name}</Typography>
                    {task.helper?.numReviews > 0 && (
                      <Chip 
                        icon={<Star style={{ color: '#fbbf24', fontSize: 14 }} />}
                        label={`${task.helper.rating.toFixed(1)}`} 
                        size="small" variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem', borderColor: '#fbbf24', color: 'text.secondary' }}
                      />
                    )}
                  </Stack>
                  {task.helper?.phone && (
                    <Typography variant="caption" component="a" href={`tel:${task.helper.phone}`} sx={{ color: 'primary.main', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Phone sx={{ fontSize: 12 }} /> {task.helper.phone}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* ACTION BUTTONS (Bottom) */}
            <Stack spacing={1.5}>
              {/* Chat Button  */}
              {(isCreator || isHelper || isAdmin) && (
                <Button 
                  variant="outlined" color="primary" size="medium" startIcon={<ChatIcon />} 
                  onClick={() => setChatOpen(true)} fullWidth sx={{ textTransform: 'none' }}
                >
                  Open Chat / Messages
                </Button>
              )}

              {/* Mark Complete Button */}
              {isHelper && task.status === 'claimed' && (
                <Button variant="contained" color="success" fullWidth size="large" onClick={handleComplete} disabled={isProcessing} disableElevation sx={{ textTransform: 'none', fontWeight: 'bold' }}>
                  {isProcessing ? 'Completing...' : 'Mark as Complete'}
                </Button>
              )}
              
              {/* Completed Chip */}
              {task.status === 'completed' && (
                 <Box sx={{ textAlign: 'center', mt: 1 }}>
                   <Chip label="Task Completed Successfully" color="success" sx={{ py: 1, width: '100%', fontWeight: 'bold' }} />
                 </Box>
              )}
            </Stack>

            {isCreator && task.status === 'claimed' && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1.5} textAlign="center">
                Waiting for the helper to mark this task as complete.
              </Typography>
            )}
          </Box>
        )}
        
        {error && <Typography color="error" variant="caption" mt={1} display="block">{error}</Typography>}
      
      </CardContent>

      {/* CHAT MODAL */}
      <Dialog 
        open={chatOpen} 
        onClose={() => setChatOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { height: '80vh', display: 'flex', flexDirection: 'column' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">Task Messages</Typography>
          </Stack>
          <IconButton onClick={() => setChatOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0, flexGrow: 1, bgcolor: '#f9f9f9' }}>
          <ChatBox taskId={task._id} />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isProcessing}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={isProcessing}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
