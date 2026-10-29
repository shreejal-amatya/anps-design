INSERT INTO categories(slug,title) VALUES
('weddings','Weddings'),('pre-post-wedding','Pre / Post Wedding'),('pasni','Rice Feeding / Pasni'),
('portraits','Portraits'),('events','Events'),('graphic-banner','Graphic & Banner Design'),('motion-video','Films & Motion')
ON CONFLICT(slug) DO NOTHING;
CREATE INDEX media_creator_pending ON media_assets(created_by,processing_status,created_at);
CREATE INDEX project_media_asset ON project_media(asset_id,project_id);
