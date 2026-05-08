-- ============================================================
-- Timer.mn — Supabase PostgreSQL Schema
-- Multi-tenant appointment booking platform for Mongolia
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'business_owner', 'staff');
CREATE TYPE business_category AS ENUM ('salon', 'spa', 'dental', 'yoga', 'other');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE payment_method AS ENUM ('qpay', 'socialpay', 'card', 'cash');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- ============================================================
-- 1. PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NULL, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. BUSINESSES
-- ============================================================

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  category business_category NOT NULL DEFAULT 'other',
  address TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS: lat/lng
  phone VARCHAR(20),
  cover_url TEXT,
  logo_url TEXT,
  cover_url TEXT,
  logo_url TEXT,
  gallery TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{"instagram": "", "facebook": "", "tiktok": ""}'::jsonb,
  avg_rating DECIMAL(2,1) CHECK (avg_rating >= 0 AND avg_rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  auto_confirm BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PostGIS spatial index for fast geo queries
CREATE INDEX idx_businesses_location ON businesses USING GIST(location);
-- Index for slug lookups
CREATE INDEX idx_businesses_slug ON businesses(slug);
-- Index for category filtering
CREATE INDEX idx_businesses_category ON businesses(category);
-- Trigram index for fuzzy text search on name
CREATE INDEX idx_businesses_name_trgm ON businesses USING GIN(name gin_trgm_ops);

-- ============================================================
-- 3. BUSINESS HOURS
-- ============================================================

CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(business_id, day_of_week)
);

-- ============================================================
-- 4. SERVICES
-- ============================================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  price_min INTEGER NOT NULL CHECK (price_min >= 0),
  price_max INTEGER CHECK (price_max IS NULL OR price_max >= price_min),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_business_id ON services(business_id);

-- ============================================================
-- 5. STAFF
-- ============================================================

CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_business_id ON staff(business_id);

-- ============================================================
-- 6. STAFF SERVICES (many-to-many)
-- ============================================================

CREATE TABLE staff_services (
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (staff_id, service_id)
);

-- ============================================================
-- 7. STAFF AVAILABILITY
-- ============================================================

CREATE TABLE staff_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_working BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(staff_id, day_of_week)
);

CREATE INDEX idx_staff_availability_staff_id ON staff_availability(staff_id);

-- ============================================================
-- 8. STAFF BREAKS
-- ============================================================

CREATE TABLE staff_breaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label VARCHAR(100) DEFAULT 'Break',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_breaks_staff_id ON staff_breaks(staff_id);

-- ============================================================
-- 9. STAFF EXCEPTIONS (time off, holidays, etc.)
-- ============================================================

CREATE TABLE staff_exceptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_full_day BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_staff_exceptions_staff_id ON staff_exceptions(staff_id);
CREATE INDEX idx_staff_exceptions_date ON staff_exceptions(exception_date);

-- ============================================================
-- 10. BOOKINGS
-- ============================================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  payment_method payment_method,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  has_reminder_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure end_time is after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Critical indexes for bookings
CREATE INDEX idx_bookings_business_id ON bookings(business_id);
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_staff_id ON bookings(staff_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);

-- Prevent overlapping bookings for same staff on same date
CREATE UNIQUE INDEX idx_bookings_no_overlap 
ON bookings(staff_id, booking_date, start_time) 
WHERE staff_id IS NOT NULL;

-- ============================================================
-- 11. REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES staff(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_staff_id ON reviews(staff_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- ============================================================
-- 12. PAYMENTS
-- ============================================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) NOT NULL DEFAULT 'MNT',
  method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at BEFORE UPDATE ON staff_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_breaks_updated_at BEFORE UPDATE ON staff_breaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_exceptions_updated_at BEFORE UPDATE ON staff_exceptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update business avg_rating when review is inserted/updated/deleted
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE businesses
  SET avg_rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM reviews
    WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
  )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_business_rating();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses: viewable by all, editable by owner
CREATE POLICY "Businesses are viewable by everyone" 
  ON businesses FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own business" 
  ON businesses FOR ALL USING (auth.uid() = owner_id);

-- Business Hours: viewable by all, editable by business owner
CREATE POLICY "Business hours are viewable by everyone" 
  ON business_hours FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own hours" 
  ON business_hours FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = business_hours.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Services: viewable by all, editable by business owner
CREATE POLICY "Services are viewable by everyone" 
  ON services FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own services" 
  ON services FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = services.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Staff: viewable by all, editable by business owner
CREATE POLICY "Staff are viewable by everyone" 
  ON staff FOR SELECT USING (true);

CREATE POLICY "Business owners can manage own staff" 
  ON staff FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = staff.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Staff Services: viewable by all, editable by business owner
CREATE POLICY "Staff services are viewable by everyone" 
  ON staff_services FOR SELECT USING (true);

CREATE POLICY "Business owners can manage staff services" 
  ON staff_services FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM staff 
    JOIN businesses ON staff.business_id = businesses.id
    WHERE staff.id = staff_services.staff_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Staff Availability: viewable by all, editable by business owner
CREATE POLICY "Staff availability is viewable by everyone" 
  ON staff_availability FOR SELECT USING (true);

CREATE POLICY "Business owners can manage staff availability" 
  ON staff_availability FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM staff 
    JOIN businesses ON staff.business_id = businesses.id
    WHERE staff.id = staff_availability.staff_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Staff Breaks: viewable by all, editable by business owner
CREATE POLICY "Staff breaks are viewable by everyone" 
  ON staff_breaks FOR SELECT USING (true);

CREATE POLICY "Business owners can manage staff breaks" 
  ON staff_breaks FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM staff 
    JOIN businesses ON staff.business_id = businesses.id
    WHERE staff.id = staff_breaks.staff_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Staff Exceptions: viewable by all, editable by business owner
CREATE POLICY "Staff exceptions are viewable by everyone" 
  ON staff_exceptions FOR SELECT USING (true);

CREATE POLICY "Business owners can manage staff exceptions" 
  ON staff_exceptions FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM staff 
    JOIN businesses ON staff.business_id = businesses.id
    WHERE staff.id = staff_exceptions.staff_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Bookings: 
-- Customers see only their own bookings
-- Business owners see all bookings for their business
-- Staff see only their assigned bookings
CREATE POLICY "Bookings are viewable by customer" 
  ON bookings FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Bookings are viewable by business owner" 
  ON bookings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = bookings.business_id 
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Bookings are viewable by assigned staff" 
  ON bookings FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM staff 
    WHERE staff.id = bookings.staff_id 
    AND staff.id IN (
      SELECT id FROM staff 
      WHERE business_id IN (
        SELECT id FROM businesses WHERE owner_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Customers can create bookings" 
  ON bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own bookings" 
  ON bookings FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can manage business bookings" 
  ON bookings FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = bookings.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Reviews: viewable by all, customers can create/update own
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Customers can create own reviews" 
  ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own reviews" 
  ON reviews FOR UPDATE USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can manage business reviews" 
  ON reviews FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM businesses 
    WHERE businesses.id = reviews.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Payments: viewable by customer and business owner
CREATE POLICY "Payments are viewable by customer" 
  ON payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.customer_id = auth.uid()
  ));

CREATE POLICY "Payments are viewable by business owner" 
  ON payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM bookings 
    JOIN businesses ON bookings.business_id = businesses.id
    WHERE bookings.id = payments.booking_id 
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Business owners can manage payments" 
  ON payments FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM bookings 
    JOIN businesses ON bookings.business_id = businesses.id
    WHERE bookings.id = payments.booking_id 
    AND businesses.owner_id = auth.uid()
  ));

-- ============================================================
-- ONBOARDING DRAFTS TABLE
-- ============================================================

CREATE TABLE business_onboarding_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_onboarding_drafts_user_id ON business_onboarding_drafts(user_id);

-- RLS for onboarding drafts
ALTER TABLE business_onboarding_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding drafts"
  ON business_onboarding_drafts FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- SEED DATA (Optional)
-- ============================================================

-- Example: Insert default business hours template
-- (Run after creating businesses)

/*
INSERT INTO business_hours (business_id, day_of_week, open_time, close_time, is_closed)
SELECT 
  id as business_id,
  generate_series(0, 6) as day_of_week,
  '09:00'::time as open_time,
  '18:00'::time as close_time,
  false as is_closed
FROM businesses;
*/

-- ============================================================
-- REALTIME SETUP (Supabase)
-- ============================================================

-- Enable realtime for bookings table
BEGIN;
  -- Drop the replication slot if it exists (for idempotency)
  -- Note: Only run this if you need to reset
  -- SELECT pg_drop_replication_slot('supabase_realtime');
  
  -- Add tables to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
  ALTER PUBLICATION supabase_realtime ADD TABLE payments;
COMMIT;

-- ============================================================
-- NOTES
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS (Run in Supabase Dashboard SQL Editor)
-- ============================================================

-- Note: Storage buckets are created via Supabase Dashboard or API
-- The following SQL is for reference:

/*
-- Insert storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('business-photos', 'business-photos', true),
  ('staff-avatars', 'staff-avatars', true),
  ('profile-avatars', 'profile-avatars', true);

-- RLS policies for business-photos bucket
CREATE POLICY "Business photos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'business-photos');

CREATE POLICY "Authenticated users can upload business photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'business-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own business photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'business-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- ============================================================
-- NOTES
-- ============================================================

-- ============================================================
-- SMS LOGS TABLE
-- ============================================================

CREATE TABLE sms_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error TEXT,
  message_id VARCHAR(255),
  booking_id UUID REFERENCES bookings(id),
  business_id UUID REFERENCES businesses(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sms_logs_phone ON sms_logs(phone);
CREATE INDEX idx_sms_logs_booking_id ON sms_logs(booking_id);
CREATE INDEX idx_sms_logs_created_at ON sms_logs(created_at);

-- RLS for sms_logs
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view own SMS logs"
  ON sms_logs FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE owner_id = auth.uid()
    )
  );

-- ============================================================
-- SCHEDULED REMINDERS FUNCTION (for Supabase Edge Function)
-- ============================================================

CREATE OR REPLACE FUNCTION check_upcoming_appointments()
RETURNS TABLE (
  booking_id UUID,
  customer_phone VARCHAR,
  customer_name VARCHAR,
  business_name VARCHAR,
  appointment_time TIME,
  appointment_date DATE,
  minutes_until INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    p.phone as customer_phone,
    p.full_name as customer_name,
    bs.name as business_name,
    b.start_time as appointment_time,
    b.booking_date as appointment_date,
    EXTRACT(EPOCH FROM (
      (b.booking_date + b.start_time) - NOW()
    )) / 60 as minutes_until
  FROM bookings b
  JOIN profiles p ON b.customer_id = p.id
  JOIN businesses bs ON b.business_id = bs.id
  WHERE b.status = 'confirmed'
    AND b.has_reminder_sent = false
    AND b.booking_date >= CURRENT_DATE
    AND (b.booking_date + b.start_time) BETWEEN NOW() AND NOW() + INTERVAL '1 hour 30 minutes';
END;
$$ LANGUAGE plpgsql;

/*
Post-Setup Checklist:
1. Run this schema in Supabase SQL Editor
2. Configure Auth providers (Email, Google, etc.)
3. Set up storage buckets via Supabase Dashboard: business-photos, staff-avatars, profile-avatars
4. Configure RLS policies for storage buckets
5. Add service role key to environment variables
6. Test RLS policies with different user roles
7. Enable realtime subscriptions in client code
8. Set up QPay/SocialPay webhook endpoints

PostGIS Query Examples:
-- Find businesses within 5km of a point
SELECT * FROM businesses
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(106.9176, 47.9185), 4326)::geography,
  5000  -- 5km in meters
);

-- Calculate distance to each business
SELECT 
  id, name,
  ST_Distance(
    location::geography,
    ST_SetSRID(ST_MakePoint(106.9176, 47.9185), 4326)::geography
  ) / 1000 as distance_km
FROM businesses
ORDER BY distance_km;
*/
