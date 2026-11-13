INSERT INTO services(slug,title,description,status,sort_order) VALUES
('photography-films','Photography & Films','Wedding, pre-wedding, post-wedding and Pasni coverage—through photographs and video.','published',0),
('design-motion','Design & Motion','Graphic design, banner design and motion work for the message you want to share.','published',1)
ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,sort_order=EXCLUDED.sort_order;