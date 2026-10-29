CREATE TABLE admin_members (
 user_id text PRIMARY KEY, role text NOT NULL CHECK (role IN ('owner','editor')),
 enquiry_access boolean NOT NULL DEFAULT false, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE media_assets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), provider text NOT NULL,
 provider_asset_id text NOT NULL, kind text NOT NULL CHECK(kind IN ('image','youtube')),
 mime_type text, bytes bigint CHECK(bytes>=0), width integer CHECK(width>0), height integer CHECK(height>0),
 alt_text text NOT NULL DEFAULT '', caption text NOT NULL DEFAULT '', video_id text,
 processing_status text NOT NULL DEFAULT 'pending' CHECK(processing_status IN ('pending','ready','failed')),
 rights_confirmed boolean NOT NULL DEFAULT false, created_by text REFERENCES admin_members(user_id),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,provider_asset_id)
);
CREATE TABLE services (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL,
 title text NOT NULL, description text NOT NULL DEFAULT '', body jsonb NOT NULL DEFAULT '{}',
 cover_asset_id uuid REFERENCES media_assets(id), sort_order integer NOT NULL DEFAULT 0,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE projects (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL, title text NOT NULL,
 summary text NOT NULL DEFAULT '', body jsonb NOT NULL DEFAULT '{}', seo jsonb NOT NULL DEFAULT '{}',
 cover_asset_id uuid REFERENCES media_assets(id), featured boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
 published_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status <> 'published' OR published_at IS NOT NULL)
);
CREATE TABLE categories(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE NOT NULL, title text NOT NULL);
CREATE TABLE project_categories(project_id uuid REFERENCES projects(id) ON DELETE CASCADE, category_id uuid REFERENCES categories(id), PRIMARY KEY(project_id,category_id));
CREATE TABLE project_services(project_id uuid REFERENCES projects(id) ON DELETE CASCADE, service_id uuid REFERENCES services(id), PRIMARY KEY(project_id,service_id));
CREATE TABLE project_media(project_id uuid REFERENCES projects(id) ON DELETE CASCADE, asset_id uuid REFERENCES media_assets(id), sort_order integer NOT NULL DEFAULT 0, layout_role text NOT NULL DEFAULT 'gallery', PRIMARY KEY(project_id,asset_id), UNIQUE(project_id,sort_order));
CREATE TABLE site_settings(key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE enquiries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), submission_key uuid UNIQUE NOT NULL,
 name text NOT NULL CHECK(length(name) BETWEEN 1 AND 120), reply_contact text NOT NULL CHECK(length(reply_contact) BETWEEN 3 AND 254),
 service_id uuid REFERENCES services(id), project_id uuid REFERENCES projects(id), service_label text NOT NULL,
 event_date date, event_location text, message text NOT NULL CHECK(length(message) BETWEEN 10 AND 5000), budget text,
 source text NOT NULL DEFAULT 'website', status text NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','quoted','won','closed','spam')),
 consent_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notification_outbox(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), enquiry_id uuid UNIQUE NOT NULL REFERENCES enquiries(id), status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed')), attempts integer NOT NULL DEFAULT 0 CHECK(attempts>=0), next_attempt_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE audit_log(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text REFERENCES admin_members(user_id), action text NOT NULL, entity_id text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX projects_published ON projects(status,published_at DESC);
CREATE INDEX services_order ON services(status,sort_order);
CREATE INDEX enquiries_inbox ON enquiries(status,created_at DESC);
CREATE INDEX category_projects ON project_categories(category_id,project_id);
CREATE INDEX notification_retry ON notification_outbox(status,next_attempt_at);
