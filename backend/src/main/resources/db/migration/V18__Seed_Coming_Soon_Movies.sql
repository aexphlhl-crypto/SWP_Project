-- Update status and release date of future blockbusters to 'ComingSoon' with a future release date
-- so they are not auto-transitioned to 'NowShowing' by the database scheduler.

UPDATE Movies 
SET status = 'ComingSoon', release_date = '2026-12-25' 
WHERE movie_id IN (3015, 3017, 3018, 3019, 3020);
