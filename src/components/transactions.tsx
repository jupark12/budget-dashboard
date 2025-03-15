import React, { useEffect, useState } from 'react';
import { Box, List, ListItem, Typography, Paper, Divider, Chip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  created_at: string;
}

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8050/transactions');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setTransactions(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch transactions. Please try again later.');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  if (loading) {
    return <Typography>Loading transactions...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (transactions.length === 0) {
    return <Typography>No transactions found.</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, maxHeight: '500px', overflow: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Recent Transactions
      </Typography>
      <List>
        {transactions.map((transaction, index) => (
          <React.Fragment key={transaction.id}>
            {index > 0 && <Divider />}
            <ListItem sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
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
    </Paper>
  );
};

export default TransactionList;