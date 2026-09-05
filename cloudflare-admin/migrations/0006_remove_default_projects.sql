DELETE FROM content
WHERE type = 'project'
  AND slug IN ('documind', 'leaflens', 'sentipulse', 'dreamframe');
