import useAuth from "../auth/useAuth";
import api from "../../lib/api";
import ChatBox from "./ChatBox";
import { Button, Card, CardContent, Typography, Chip, Stack, Box, Avatar, Divider, TextField } from "@mui/material";
import { CheckCircle, Pending, LocationOn, AccessTime, Star, Gavel } from "@mui/icons-material";
import { useState } from "react";

export default function TaskCard({ task, onUpdate }) {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const currentUserId = user?._id || user?.id;
  const isCreator = currentUserId === task?.requester?._id;
  const isHelper = currentUserId === task?.helper?._id;
  const hasBid = task?.bids?.find(b => b.helper?._id === currentUserId);

  const handlePlaceBid = async () => {
    if (!bidAmount) return;
    setIsProcessing(true);
    try {
      const res = await api.post(`/tasks/${task._id}/bid`, { amount: Number(bidAmount), message: "I can do this!" });
      onUpdate(res.data.data);
      setBidAmount('');
    } catch (err) { setError(err.response?.data?.error || "Bid failed"); } finally { setIsProcessing(false); }
  };

  const handleAcceptBid = async (bidId) => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/accept-bid`, { bidId });
      onUpdate(res.data.data);
    } catch (err) { setError(err.response?.data?.error || "Failed to accept bid"); } finally { setIsProcessing(false); }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      const res = await api.put(`/tasks/${task._id}/complete`);
      onUpdate(res.data.data);
    } catch (err) { setError(err.response?.data?.error || "Failed to complete"); } finally { setIsProcessing(false); }
  };

  return (
    <Card sx={{ mb: 2, border: task.isUrgent ? '2px solid red' : '1px solid #e0e0e0' }}>
      {task.isUrgent && <Box sx={{ bgcolor: 'error.main', color: 'white', textAlign: 'center', py: 0.5, fontSize: '0.8rem', fontWeight: 'bold' }}>🚨 URGENT TASK</Box>}
      
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="h6" fontWeight="bold">{task.title}</Typography>
            <Stack direction="row" spacing={1} mt={0.5}>
              <Chip label={`KES ${task.price}`} color="success" size="small" sx={{ fontWeight: 'bold' }} />
              <Chip label={task.category.toUpperCase()} size="small" variant="outlined" />
              <Chip icon={<AccessTime />} label={new Date(task.createdAt).toLocaleDateString()} size="small" />
            </Stack>
          </Box>
          <Chip label={task.status.toUpperCase()} color={task.status === 'open' ? 'warning' : task.status === 'claimed' ? 'info' : 'success'} />
        </Stack>

        <Typography variant="body2" sx={{ my: 2 }}>{task.description}</Typography>
        <Stack direction="row" spacing={1} alignItems="center" mb={2}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">{task.location.address}</Typography>
        </Stack>

        {/* CREATOR VIEW: SEE BIDS */}
        {isCreator && task.status === 'open' && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom><Gavel fontSize="small"/> Bids Received ({task.bids.length})</Typography>
            {task.bids.map(b => (
              <Box key={b._id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, bgcolor: 'white', p: 1, borderRadius: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 24, height: 24 }}>{b.helper?.name?.charAt(0)}</Avatar>
                  <Typography variant="body2">{b.helper?.name}</Typography>
                  {b.helper?.numReviews > 0 && <Chip icon={<Star style={{ color: 'gold', fontSize: 12 }} />} label={b.helper.rating.toFixed(1)} size="small" />}
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight="bold" color="success.main">KES {b.amount}</Typography>
                  <Button size="small" variant="contained" color="primary" onClick={() => handleAcceptBid(b._id)} disabled={isProcessing}>Accept</Button>
                </Stack>
              </Box>
            ))}
            {task.bids.length === 0 && <Typography variant="caption">No bids yet.</Typography>}
          </Box>
        )}

        {/* HELPER VIEW: PLACE BID */}
        {!isCreator && task.status === 'open' && !hasBid && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <TextField size="small" type="number" label="Your Bid (KES)" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
            <Button variant="contained" onClick={handlePlaceBid} disabled={isProcessing}>Place Bid</Button>
          </Box>
        )}
        
        {hasBid && task.status === 'open' && (
          <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>You have placed a bid of KES {hasBid.amount}. Waiting for approval.</Typography>
        )}

        {/* MARK COMPLETE (HELPER) */}
        {isHelper && task.status === 'claimed' && (
          <Button variant="contained" color="success" fullWidth sx={{ mt: 2 }} onClick={handleComplete} disabled={isProcessing}>
            Mark as Complete
          </Button>
        )}

        {/* CHAT */}
        {task.status !== 'open' && (isCreator || isHelper) && (
          <Box mt={3}><ChatBox taskId={task._id} /></Box>
        )}
        
        {error && <Typography color="error" variant="caption">{error}</Typography>}
      </CardContent>
    </Card>
  );
}
