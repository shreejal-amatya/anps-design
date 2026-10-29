ALTER TABLE enquiries ADD COLUMN request_hash text;
CREATE TABLE enquiry_rate_limits (
 bucket_hash text PRIMARY KEY,
 window_start timestamptz NOT NULL,
 requests integer NOT NULL CHECK(requests > 0)
);
