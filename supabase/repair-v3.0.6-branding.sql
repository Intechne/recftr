-- V3.0.6 branding settings. Safe to run repeatedly.
INSERT INTO settings(key,value) VALUES
  ('site_logo',''),
  ('site_mark',''),
  ('favicon_url',''),
  ('apple_touch_icon_url',''),
  ('og_image','')
ON CONFLICT (key) DO NOTHING;
