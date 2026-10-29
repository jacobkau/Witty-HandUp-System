import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import ChatBox from "./ChatBox";
import { 
  Button, Card, CardContent, Typography, Chip, Stack, Box, Avatar, 
  Divider, TextField, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions 
} from "@mui/material";
import { 
  LocationOn, Star, Gavel, 
  Phone, Delete, Edit, 
  Chat as ChatIcon, Close as CloseIcon, Person as PersonIcon, CheckCircle, Payment, DoneAll
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskCard({ task, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [bidAmount, setBidAmount] = useState('');
  const [paymentCode, setPaymentCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const currentUserId = user?._id || user?.id;
  const isCreator = currentUserId === task?.requester?._id;
  const isHelper = currentUserId === task?.helper?._id;
  const isAdmin = user?.role === 'admin'; 
  const hasBid = task?.bids?.find(b => (b.helper?._id || b.helper) === currentUserId);

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

  const handleMarkWorkDone = async () => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/mark-work-completed`);
      onUpdate(res.data.data);
    } catch (err) { 
      setError(err.response?.data?.error || "Failed to update"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentCode.trim()) return;
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/submit-payment`, { paymentCode });
      onUpdate(res.data.data);
    } catch (err) { 
      setError(err.response?.data?.error || "Failed to submit payment"); 
    } finally { 
      setIsProcessing(false); 
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/confirm-payment`);
      onUpdate(res.data.data);
    } catch (err) { 
      setError(err.response?.data?.error || "Failed to confirm payment"); 
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

  const getStatusChip = () => {
    let color = 'warning';
    if (task.status === 'claimed') color = 'info';
    if (task.status === 'work_completed') color = 'secondary';
    if (task.status === 'awaiting_verification') color = 'secondary';
    if (task.status === 'completed') color = 'success';
    
    return <Chip label={task.status.replace('_', ' ').toUpperCase()} color={color} size="small" sx={{ fontWeight: 'bold' }} />
  }

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', boxShadow: 1, borderRadius: 2 }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>{task.title}</Typography>
          {getStatusChip()}
        </Stack>

        <Stack direction="row" spacing={1} mt={1.5} mb={2} flexWrap="wrap">
          <Chip label={`KES ${task.price}`} color="success" size="small" sx={{ fontWeight: 'bold' }} />
          <Chip label={task.category.toUpperCase()} size="small" variant="outlined" />
        </Stack>

        {(isCreator || isAdmin) && (
          <Stack direction="row" spacing={1} justifyContent="flex-end" mb={1}>
            <IconButton size="small" onClick={() => navigate(`/tasks/edit/${task._id}`, { state: { taskData: task } })} disabled={task.status !== 'open'}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => setDeleteConfirmOpen(true)}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, flexGrow: 1 }}>
          {task.description}
        </Typography>

        <Stack spacing={1.5} mb={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary" noWrap>{task.location.address || "Coordinates pinned"}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <PersonIcon fontSize="small" color="action" />
            <Avatar sx={{ width: 20, height: 20, fontSize: 10, bgcolor: 'primary.main' }}>{task.requester?.name?.charAt(0)}</Avatar>
            <Typography variant="caption" color="text.secondary">Posted by {task.requester?.name}</Typography>
          </Stack>
        </Stack>

        {/* BIDDING SECTION */}
        {task.status === 'open' && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
            {isCreator && (
              <Box>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  <Gavel fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} /> Bids ({task.bids?.length || 0})
                </Typography>
                {task.bids?.length > 0 ? (
                  task.bids.map(b => (
                    <Box key={b._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: 'grey.50', p: 1.5, borderRadius: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{b.helper?.name?.charAt(0)}</Avatar>
                        <Typography variant="body2" fontWeight="medium">{b.helper?.name}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight="bold" color="success.main" variant="body2">KES {b.amount}</Typography>
                        <Button size="small" variant="contained" onClick={() => handleAcceptBid(b._id)} disabled={isProcessing}>Accept</Button>
                      </Stack>
                    </Box>
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">No bids yet.</Typography>
                )}
              </Box>
            )}

            {!isCreator && !hasBid && (
              <Stack direction="row" spacing={1}>
                <TextField size="small" type="number" placeholder="Bid amount" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} fullWidth />
                <Button variant="contained" onClick={handlePlaceBid} disabled={isProcessing || !bidAmount}>Bid</Button>
              </Stack>
            )}
            
            {hasBid && (
              <Box sx={{ bgcolor: 'success.50', p: 1.5, borderRadius: 1, textAlign: 'center' }}>
                <Typography variant="body2" color="success.main" fontWeight="bold">✓ Your bid of KES {hasBid.amount} is pending.</Typography>
              </Box>
            )}
          </Box>
        )}

        {/* WORKFLOW */}
        {['claimed', 'work_completed', 'awaiting_verification', 'completed'].includes(task.status) && task.helper && (
          <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #f0f0f0' }}>
            <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2, mb: 2 }}>
              <Typography variant="caption" fontWeight="bold" color="text.secondary">HELPER</Typography>
              <Stack direction="row" spacing={1.5} alignItems="center" mt={1}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'info.main' }}>{task.helper?.name?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight="bold">{task.helper?.name}</Typography>
                  {task.helper?.phone && <Typography variant="caption" component="a" href={`tel:${task.helper.phone}`} sx={{ color: 'primary.main', textDecoration: 'none' }}>{task.helper.phone}</Typography>}
                </Box>
              </Stack>
            </Box>

            <Stack spacing={1.5}>
              {(isCreator || isHelper || isAdmin) && (
                <Button variant="outlined" size="small" startIcon={<ChatIcon />} onClick={() => setChatOpen(true)} fullWidth>Chat</Button>
              )}

              {task.status === 'claimed' && isHelper && (
                <Button variant="contained" color="primary" startIcon={<DoneAll />} fullWidth onClick={handleMarkWorkDone} disabled={isProcessing}>Mark Work as Done</Button>
              )}

              {task.status === 'work_completed' && isCreator && (
                <Stack spacing={1} sx={{ mt: 1, bgcolor: 'success.50', p: 1.5, borderRadius: 1 }}>
                  <Typography variant="caption" color="success.main" fontWeight="bold">Pay KES {task.price} via M-Pesa:</Typography>
                  <TextField size="small" placeholder="Transaction code" value={paymentCode} onChange={(e) => setPaymentCode(e.target.value)} sx={{ bgcolor: 'white' }} />
                  <Button variant="contained" color="success" startIcon={<Payment />} onClick={handleSubmitPayment} disabled={isProcessing || !paymentCode}>Submit Code</Button>
                </Stack>
              )}

              {task.status === 'awaiting_verification' && isHelper && (
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                  <Typography variant="caption" display="block" mb={1}>Code: <strong>{task.paymentCode}</strong></Typography>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} fullWidth onClick={handleConfirmPayment} disabled={isProcessing}>Confirm Received</Button>
                </Box>
              )}

              {task.status === 'completed' && (
                 <Chip label="Task Completed & Paid" color="success" sx={{ py: 1, width: '100%', fontWeight: 'bold' }} />
              )}
            </Stack>
          </Box>
        )}
        
        {error && <Typography color="error" variant="caption" mt={1}>{error}</Typography>}
      </CardContent>

      <Dialog open={chatOpen} onClose={() => setChatOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { height: '80vh' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Chat
          <IconButton onClick={() => setChatOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f9f9f9' }}><ChatBox taskId={task._id} /></DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Task?</DialogTitle>
        <DialogContent><Typography>This action cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
