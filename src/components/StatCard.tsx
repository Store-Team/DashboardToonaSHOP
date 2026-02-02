
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, icon, color = 'primary.main' }) => {
  const isPositive = trend >= 0;

  return (
    <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}15`, color: color }}>
          {icon}
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {isPositive ? (
          <TrendingUp sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
        ) : (
          <TrendingDown sx={{ color: 'error.main', fontSize: 16, mr: 0.5 }} />
        )}
        <Typography variant="caption" sx={{ color: isPositive ? 'success.main' : 'error.main', fontWeight: 600 }}>
          {Math.abs(trend)}%
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
          since last month
        </Typography>
      </Box>
    </Paper>
  );
};

export default StatCard;
