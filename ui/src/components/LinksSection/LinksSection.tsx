import { useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Button,
  Link as MuiLink,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  AutoAwesome as AutoIcon,
} from '@mui/icons-material';

export interface TaskLink {
  title: string;
  url: string;
}

interface LinksSectionProps {
  links: TaskLink[];
  onChange: (links: TaskLink[]) => void;
  htmlContent?: string; // Content to extract links from
  readOnly?: boolean;
}

// Extract links from HTML content
const extractLinksFromHtml = (html: string): TaskLink[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const anchors = doc.querySelectorAll('a[href]');
  const links: TaskLink[] = [];

  anchors.forEach((anchor) => {
    const url = anchor.getAttribute('href');
    const title = anchor.textContent?.trim() || url || '';
    if (url && url.startsWith('http')) {
      links.push({ title, url });
    }
  });

  // Also find plain URLs in text
  const urlRegex = /https?:\/\/[^\s<>"]+/g;
  const textContent = doc.body.textContent || '';
  const matches = textContent.match(urlRegex) || [];

  matches.forEach((url) => {
    if (!links.some((l) => l.url === url)) {
      try {
        const urlObj = new URL(url);
        links.push({
          title: urlObj.hostname,
          url,
        });
      } catch {
        links.push({ title: url, url });
      }
    }
  });

  return links;
};

const LinksSection = ({
  links,
  onChange,
  htmlContent,
  readOnly = false,
}: LinksSectionProps) => {
  const handleAutoExtract = useCallback(() => {
    if (!htmlContent) return;
    const extracted = extractLinksFromHtml(htmlContent);

    // Merge with existing, avoiding duplicates
    const existingUrls = new Set(links.map((l) => l.url));
    const newLinks = extracted.filter((l) => !existingUrls.has(l.url));

    if (newLinks.length > 0) {
      onChange([...links, ...newLinks]);
    }
  }, [htmlContent, links, onChange]);

  // Auto-extract when content changes (with debounce)
  useEffect(() => {
    if (htmlContent && links.length === 0) {
      const timer = setTimeout(handleAutoExtract, 500);
      return () => clearTimeout(timer);
    }
  }, [htmlContent, links.length, handleAutoExtract]);

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: 'title' | 'url', value: string) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  if (readOnly) {
    return links.length > 0 ? (
      <Box>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <LinkIcon fontSize="small" /> Links
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {links.map((link, idx) => (
            <MuiLink
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: 14 }}
            >
              {link.title || link.url}
            </MuiLink>
          ))}
        </Box>
      </Box>
    ) : null;
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <LinkIcon fontSize="small" /> Links
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {htmlContent && (
            <Button
              size="small"
              startIcon={<AutoIcon />}
              onClick={handleAutoExtract}
              sx={{ textTransform: 'none', fontSize: 12 }}
            >
              Auto Extract
            </Button>
          )}
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => onChange([...links, { title: '', url: '' }])}
            sx={{ textTransform: 'none', fontSize: 12 }}
          >
            Add Link
          </Button>
        </Box>
      </Box>

      {links.map((link, idx) => (
        <Box
          key={idx}
          sx={{
            display: 'flex',
            gap: 1,
            mb: 1,
            alignItems: 'flex-start',
          }}
        >
          <TextField
            size="small"
            label="Title"
            value={link.title}
            onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            size="small"
            label="URL"
            value={link.url}
            onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
            sx={{
              flex: 2,
              '& input': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
          />
          <IconButton size="small" onClick={() => handleRemove(idx)} sx={{ mt: 0.5 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
};

export default LinksSection;
