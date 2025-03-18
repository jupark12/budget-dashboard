import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Typography, Paper, Divider, Chip, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import { useGlobalContext } from '~/context/GlobalContext';
import { GeistSans } from 'geist/font/sans';
import { formatCurrency } from '~/util/func';

const TransactionList: React.FC = () => {
  const { shouldRefreshTransactions, transactions, refreshTransactions, setTransactions, error, setError } = useGlobalContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jobDeleteDialogOpen, setJobDeleteDialogOpen] = useState(false);

  // Refetch transactions when a job completes
  useEffect(() => {
    if (shouldRefreshTransactions) {
      console.log('Job completed, refreshing transactions');
      refreshTransactions();
    }
  }, [shouldRefreshTransactions]);

  // Handle transaction deletion
  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
    setTransactionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`http://localhost:8050/transactions/${transactionToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove the deleted transaction from the state
      setTransactions(transactions.filter(t => t.id !== transactionToDelete.id));
      handleCloseDialog();

    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle most recent job deletion
  const handleDeleteMostRecentJob = () => {
    setJobDeleteDialogOpen(true);
  };

  const handleCloseJobDialog = () => {
    setJobDeleteDialogOpen(false);
  };

  const handleConfirmJobDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch('http://localhost:8050/jobs/most-recent', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Refresh transactions after deleting the job
      refreshTransactions();
      handleCloseJobDialog();

    } catch (err) {
      console.error('Error deleting most recent job:', err);
      setError('Failed to delete most recent job. Please try again later.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (transactions === null || (transactions.length === 0)) {
    return (
      <></>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, width: '100%', maxWidth: '1026px' }}>
        <p className={GeistSans.className + " font-bold text-3xl"}>
          Recent Transactions
        </p>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteMostRecentJob}
          size="small"
        >
          Delete Most Recent Job
        </Button>
      </Box>

      <List sx={{ width: '100%', maxWidth: '1026px', maxHeight: '530px', overflowY: 'auto' }}>
        {transactions && transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            <ListItem
              sx={{
                py: 2,
                backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'transparent',
                borderRadius: 1,
                mb: 1
              }}
              className="transform transition-all duration-500 ease-out opacity-0 translate-y-4 animate-slide-in"
              style={{ animationDelay: `${Math.log(index + 1) * 300}ms` }}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteClick(transaction)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', pr: 6 }}>
                <Box>
                  <Typography variant="subtitle1">{transaction.description}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {transaction.date}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="subtitle1"
                    color={transaction.type === 'credit' ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'bold', mr: 1 }}
                  >
                    {formatCurrency(transaction.amount)}
                  </Typography>
                  <Chip
                    icon={transaction.type === 'credit' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                    label={transaction.type === 'credit' ? 'Credit' : 'Debit'}
                    color={transaction.type === 'credit' ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </ListItem>
          </React.Fragment>
        ))}
      </List>

      {/* Transaction Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDialog}
      >
        <DialogTitle>Delete Transaction</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this transaction?
            {transactionToDelete && (
              <Box sx={{ mt: 2 }}>
                <Typography><strong>Description:</strong> {transactionToDelete.description}</Typography>
                <Typography><strong>Amount:</strong> {formatCurrency(transactionToDelete.amount)}</Typography>
                <Typography><strong>Date:</strong> {transactionToDelete.date}</Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isDeleting}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Job Delete Confirmation Dialog */}
      <Dialog
        open={jobDeleteDialogOpen}
        onClose={handleCloseJobDialog}
      >
        <DialogTitle>Delete Most Recent Job</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the most recent job and all its associated transactions?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseJobDialog} disabled={isDeleting}>Cancel</Button>
          <Button
            onClick={handleConfirmJobDelete}
            color="error"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TransactionList;