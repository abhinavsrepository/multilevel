import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  IconButton,
  Button,
  Divider,
  useTheme,
  Skeleton,
  Alert,
  alpha,
} from '@mui/material';
import {
  Search,
  ExpandMore,
  ThumbUp,
  ThumbDown,
  HelpOutline,
  Add,
  QuestionAnswer,
  Article,
  LiveHelp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import EmptyState from '@/components/common/EmptyState';
import { getFAQs, getFAQCategories, markFAQHelpful, markFAQNotHelpful } from '@/api/ticket.api';
import { FAQ as FAQType, FAQCategory } from '@/types';

const FAQ: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [helpfulFaqs, setHelpfulFaqs] = useState<Set<number>>(new Set());
  const [notHelpfulFaqs, setNotHelpfulFaqs] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, [selectedCategory, searchTerm]);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: 0,
        size: 100,
      };

      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await getFAQs(params);
      setFaqs(response.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getFAQCategories();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load FAQ categories:', err);
    }
  };

  const handleMarkHelpful = async (faqId: number) => {
    try {
      await markFAQHelpful(faqId);
      setHelpfulFaqs((prev) => new Set(prev).add(faqId));
      setNotHelpfulFaqs((prev) => {
        const next = new Set(prev);
        next.delete(faqId);
        return next;
      });
      // Refresh FAQs to get updated counts
      fetchFAQs();
    } catch (err: any) {
      console.error('Failed to mark as helpful:', err);
    }
  };

  const handleMarkNotHelpful = async (faqId: number) => {
    try {
      await markFAQNotHelpful(faqId);
      setNotHelpfulFaqs((prev) => new Set(prev).add(faqId));
      setHelpfulFaqs((prev) => {
        const next = new Set(prev);
        next.delete(faqId);
        return next;
      });
      // Refresh FAQs to get updated counts
      fetchFAQs();
    } catch (err: any) {
      console.error('Failed to mark as not helpful:', err);
    }
  };

  const handleAccordionChange = (faqId: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? faqId : null);
  };

  const filteredFaqs = selectedCategory
    ? faqs.filter((faq) => faq.category === selectedCategory)
    : faqs;

  if (loading && faqs.length === 0) {
    return (
      <DashboardLayout title="FAQ">
        <Box>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 3 }} />
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </>
    );
  }

  return (
    <DashboardLayout title="Frequently Asked Questions">
      <Box>
        {/* Header */}
        <Paper
          sx={{
            p: 4,
            mb: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            textAlign: 'center',
          }}
        >
          <HelpOutline sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            How can we help you?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
            Search our knowledge base for answers to common questions
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search for answers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'white' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              '& .MuiOutlinedInput-root': {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'white',
                '&::placeholder': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  opacity: 1,
                },
              },
            }}
          />
        </Paper>

        {/* Categories */}
        {categories.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  cursor: 'pointer',
                  border: 2,
                  borderColor: !selectedCategory ? 'primary.main' : 'transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
                onClick={() => setSelectedCategory(null)}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Article sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    All Topics
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faqs.length} articles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            {categories.slice(0, 3).map((category) => (
              <Grid item xs={12} sm={6} md={3} key={category.name}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: 2,
                    borderColor: selectedCategory === category.name ? 'primary.main' : 'transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 40, mb: 1 }}>{category.icon}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                      {category.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.count} articles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* FAQ List */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {filteredFaqs.length === 0 && !loading ? (
          <EmptyState
            variant="search"
            title="No FAQs Found"
            message="Try adjusting your search or browse through different categories"
            actionLabel="Clear Search"
            onAction={() => {
              setSearchTerm('');
              setSelectedCategory(null);
            }}
          />
        ) : (
          <Box>
            {selectedCategory && (
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={selectedCategory}
                  onDelete={() => setSelectedCategory(null)}
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {filteredFaqs.length} {filteredFaqs.length === 1 ? 'article' : 'articles'}
                </Typography>
              </Box>
            )}

            {filteredFaqs.map((faq) => (
              <Accordion
                key={faq.id}
                expanded={expandedFaq === faq.id}
                onChange={handleAccordionChange(faq.id)}
                sx={{
                  mb: 2,
                  '&:before': { display: 'none' },
                  boxShadow: theme.shadows[2],
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <QuestionAnswer color="primary" />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {faq.question}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                        <Chip label={faq.category} size="small" variant="outlined" />
                        <Chip
                          icon={<ThumbUp />}
                          label={faq.helpful || 0}
                          size="small"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Divider sx={{ mb: 2 }} />
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', mb: 3, lineHeight: 1.8 }}
                  >
                    {faq.answer}
                  </Typography>

                  {/* Helpful Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      pt: 2,
                      borderTop: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Was this helpful?
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color={helpfulFaqs.has(faq.id) ? 'success' : 'default'}
                        onClick={() => handleMarkHelpful(faq.id)}
                      >
                        <ThumbUp fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={notHelpfulFaqs.has(faq.id) ? 'error' : 'default'}
                        onClick={() => handleMarkNotHelpful(faq.id)}
                      >
                        <ThumbDown fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Still Need Help Section */}
        <Card sx={{ mt: 4, bgcolor: 'primary.lighter' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <LiveHelp sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              Still need help?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Can't find what you're looking for? Our support team is here to help!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/support/create-ticket')}
              startIcon={<Add />}
            >
              Create Support Ticket
            </Button>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default FAQ;
