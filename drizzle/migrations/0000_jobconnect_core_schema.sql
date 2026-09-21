-- ENUMS
CREATE TYPE public.app_role AS ENUM ('candidate','employer','admin');
CREATE TYPE public.job_type AS ENUM ('full-time','part-time','internship','contract','temporary');
CREATE TYPE public.workplace_type AS ENUM ('on-site','hybrid','remote');
CREATE TYPE public.experience_level AS ENUM ('intern','entry','mid','senior','lead');
CREATE TYPE public.job_status AS ENUM ('draft','published','closed');
CREATE TYPE public.application_status AS ENUM ('applied','under_review','shortlisted','interview','rejected','hired');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- CANDIDATE PROFILES
CREATE TABLE public.candidate_profiles (
  user_id UUID PRIMARY KEY,
  phone TEXT,
  location TEXT,
  headline TEXT,
  bio TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  education JSONB NOT NULL DEFAULT '[]'::jsonb,
  experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  certifications JSONB NOT NULL DEFAULT '[]'::jsonb,
  portfolio_url TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  resume_url TEXT,
  resume_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO service_role;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own candidate profile" ON public.candidate_profiles FOR ALL TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id);

-- COMPANIES
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  logo_url TEXT,
  description TEXT,
  industry TEXT,
  company_size TEXT,
  website TEXT,
  location TEXT,
  founded_year INT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies public read" ON public.companies FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "companies owner insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "companies owner update" ON public.companies FOR UPDATE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "companies owner delete" ON public.companies FOR DELETE TO authenticated USING (auth.uid() = owner_id OR public.has_role(auth.uid(),'admin'));

-- JOBS
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Engineering',
  description TEXT NOT NULL DEFAULT '',
  responsibilities TEXT[] NOT NULL DEFAULT '{}',
  requirements TEXT[] NOT NULL DEFAULT '{}',
  skills TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT[] NOT NULL DEFAULT '{}',
  job_type public.job_type NOT NULL DEFAULT 'full-time',
  workplace_type public.workplace_type NOT NULL DEFAULT 'on-site',
  location TEXT NOT NULL DEFAULT '',
  salary_min INT,
  salary_max INT,
  currency TEXT NOT NULL DEFAULT 'INR',
  experience_level public.experience_level NOT NULL DEFAULT 'entry',
  application_deadline DATE,
  status public.job_status NOT NULL DEFAULT 'published',
  applicants_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.jobs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT ALL ON public.jobs TO service_role;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs public read published" ON public.jobs FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "jobs owner read" ON public.jobs FOR SELECT TO authenticated USING (auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "jobs owner insert" ON public.jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = employer_id AND public.has_role(auth.uid(),'employer'));
CREATE POLICY "jobs owner update" ON public.jobs FOR UPDATE TO authenticated USING (auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "jobs owner delete" ON public.jobs FOR DELETE TO authenticated USING (auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));

CREATE INDEX jobs_status_created_idx ON public.jobs (status, created_at DESC);
CREATE INDEX jobs_category_idx ON public.jobs (category);
CREATE INDEX jobs_location_idx ON public.jobs (location);
CREATE INDEX jobs_search_idx ON public.jobs USING GIN (to_tsvector('english', title || ' ' || coalesce(description,'')));

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL,
  employer_id UUID,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  resume_url TEXT,
  resume_name TEXT,
  cover_letter TEXT,
  portfolio_url TEXT,
  linkedin_url TEXT,
  status public.application_status NOT NULL DEFAULT 'applied',
  interview_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, candidate_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "applications candidate read" ON public.applications FOR SELECT TO authenticated
  USING (auth.uid() = candidate_id OR auth.uid() = employer_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "applications candidate insert" ON public.applications FOR INSERT TO authenticated WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "applications update" ON public.applications FOR UPDATE TO authenticated
  USING (auth.uid() = employer_id OR auth.uid() = candidate_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "applications delete" ON public.applications FOR DELETE TO authenticated
  USING (auth.uid() = candidate_id OR public.has_role(auth.uid(),'admin'));
CREATE INDEX applications_candidate_idx ON public.applications (candidate_id, created_at DESC);
CREATE INDEX applications_job_idx ON public.applications (job_id, created_at DESC);

-- SAVED JOBS
CREATE TABLE public.saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (candidate_id, job_id)
);
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;
GRANT ALL ON public.saved_jobs TO service_role;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved jobs own" ON public.saved_jobs FOR ALL TO authenticated
  USING (auth.uid() = candidate_id) WITH CHECK (auth.uid() = candidate_id);

-- TIMESTAMP TRIGGER
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER t_profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_candidate_touch BEFORE UPDATE ON public.candidate_profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_companies_touch BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_jobs_touch BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_applications_touch BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- NEW USER HANDLER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  r := COALESCE(NULLIF(NEW.raw_user_meta_data->>'role',''), 'candidate')::public.app_role;
  IF r = 'admin' THEN r := 'candidate'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, r) ON CONFLICT DO NOTHING;

  IF r = 'candidate' THEN
    INSERT INTO public.candidate_profiles (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- APPLICANT COUNT TRIGGER
CREATE OR REPLACE FUNCTION public.sync_applicants_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.jobs SET applicants_count = applicants_count + 1 WHERE id = NEW.job_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.jobs SET applicants_count = GREATEST(applicants_count - 1, 0) WHERE id = OLD.job_id;
  END IF;
  RETURN NULL;
END; $$;

CREATE TRIGGER t_applicants_count AFTER INSERT OR DELETE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.sync_applicants_count();

-- SEED COMPANIES
INSERT INTO public.companies (id, name, slug, description, industry, company_size, website, location, founded_year, logo_url) VALUES
('11111111-1111-1111-1111-111111111101','Nimbus Labs','nimbus-labs','Cloud-native infrastructure and developer tooling for fast-moving engineering teams.','Software','201-500','https://nimbuslabs.example.com','Bengaluru, India',2016,null),
('11111111-1111-1111-1111-111111111102','Verdant Health','verdant-health','Digital health platform connecting clinics, labs and patients across India.','Healthcare','501-1000','https://verdanthealth.example.com','Pune, India',2014,null),
('11111111-1111-1111-1111-111111111103','Kite Financial','kite-financial','Modern payments and lending infrastructure for emerging markets.','Fintech','51-200','https://kitefinancial.example.com','Mumbai, India',2018,null),
('11111111-1111-1111-1111-111111111104','Orbit Studio','orbit-studio','Product design studio crafting interfaces for global SaaS brands.','Design','11-50','https://orbitstudio.example.com','Remote',2019,null),
('11111111-1111-1111-1111-111111111105','Circuitry Systems','circuitry-systems','Embedded systems and IoT hardware for industrial automation.','Electronics','201-500','https://circuitry.example.com','Hyderabad, India',2011,null),
('11111111-1111-1111-1111-111111111106','BrightReach Media','brightreach-media','Performance marketing agency for consumer tech brands.','Marketing','11-50','https://brightreach.example.com','Delhi, India',2020,null);

-- SEED JOBS
INSERT INTO public.jobs (company_id, title, category, description, responsibilities, requirements, skills, benefits, job_type, workplace_type, location, salary_min, salary_max, experience_level, created_at) VALUES
('11111111-1111-1111-1111-111111111101','Software Developer','Engineering','Build and ship reliable backend services powering our cloud platform.',ARRAY['Design and implement services','Write tests and documentation','Participate in code reviews'],ARRAY['2+ years building web services','Strong CS fundamentals','Experience with relational databases'],ARRAY['TypeScript','Node.js','PostgreSQL','Docker'],ARRAY['Health insurance','Learning budget','Flexible hours'],'full-time','hybrid','Bengaluru, India',1200000,2000000,'mid', now() - interval '2 days'),
('11111111-1111-1111-1111-111111111101','DevOps Engineer','Engineering','Own our CI/CD pipelines, observability and cloud infrastructure.',ARRAY['Maintain Kubernetes clusters','Automate deployments','Improve monitoring and alerting'],ARRAY['3+ years in DevOps or SRE','Kubernetes in production','Infrastructure as code'],ARRAY['Kubernetes','Terraform','AWS','CI/CD'],ARRAY['Stock options','Home office budget','Health insurance'],'full-time','remote','Remote',1800000,2800000,'senior', now() - interval '5 days'),
('11111111-1111-1111-1111-111111111102','Frontend Developer','Engineering','Craft accessible, fast patient-facing interfaces used by thousands daily.',ARRAY['Build React interfaces','Collaborate with designers','Improve performance and accessibility'],ARRAY['2+ years with React','Strong CSS skills','Care for accessibility'],ARRAY['React','TypeScript','Tailwind CSS','Testing'],ARRAY['Health insurance','Annual retreat','Paid parental leave'],'full-time','on-site','Pune, India',900000,1600000,'mid', now() - interval '1 day'),
('11111111-1111-1111-1111-111111111102','Data Analyst','Data','Turn clinical and product data into decisions the whole company trusts.',ARRAY['Build dashboards','Run experiments analysis','Partner with product teams'],ARRAY['SQL proficiency','Experience with BI tools','Strong communication'],ARRAY['SQL','Python','Tableau','Statistics'],ARRAY['Health insurance','Certification sponsorship'],'full-time','hybrid','Pune, India',800000,1400000,'entry', now() - interval '9 days'),
('11111111-1111-1111-1111-111111111103','Full Stack Developer','Engineering','Ship end-to-end features across our lending product.',ARRAY['Own features end to end','Work closely with product','Maintain code quality'],ARRAY['3+ years full stack experience','REST API design','Cloud deployment experience'],ARRAY['React','Node.js','PostgreSQL','AWS'],ARRAY['Stock options','Health insurance','Gym reimbursement'],'full-time','hybrid','Mumbai, India',1500000,2400000,'senior', now() - interval '3 days'),
('11111111-1111-1111-1111-111111111103','Backend Developer','Engineering','Design resilient payment services handling high transaction volumes.',ARRAY['Build payment APIs','Ensure reliability and security','Optimise database performance'],ARRAY['3+ years backend engineering','Distributed systems knowledge','Security mindset'],ARRAY['Go','PostgreSQL','Redis','Kafka'],ARRAY['Health insurance','Annual bonus'],'full-time','on-site','Mumbai, India',1400000,2200000,'mid', now() - interval '7 days'),
('11111111-1111-1111-1111-111111111104','UI/UX Designer','Design','Design intuitive product experiences for SaaS clients worldwide.',ARRAY['Run discovery workshops','Produce wireframes and prototypes','Maintain the design system'],ARRAY['Portfolio of shipped products','Figma expertise','User research experience'],ARRAY['Figma','Prototyping','User Research','Design Systems'],ARRAY['Fully remote','Flexible hours','Conference budget'],'contract','remote','Remote',700000,1300000,'mid', now() - interval '4 days'),
('11111111-1111-1111-1111-111111111104','Product Manager','Product','Lead the roadmap for our client-facing design collaboration tools.',ARRAY['Define product strategy','Write specs and success metrics','Coordinate design and engineering'],ARRAY['3+ years in product management','Strong analytical skills','Excellent writing'],ARRAY['Roadmapping','Analytics','Stakeholder Management'],ARRAY['Remote first','Equity','Learning budget'],'full-time','remote','Remote',1600000,2600000,'senior', now() - interval '11 days'),
('11111111-1111-1111-1111-111111111105','Embedded Systems Engineer','Electronics','Develop firmware for industrial IoT controllers deployed at scale.',ARRAY['Write and test embedded firmware','Debug hardware and software issues','Work with hardware teams on bring-up'],ARRAY['ECE background or equivalent','C/C++ for microcontrollers','Experience with RTOS'],ARRAY['C','C++','RTOS','ARM','I2C/SPI'],ARRAY['Health insurance','Relocation support'],'full-time','on-site','Hyderabad, India',900000,1700000,'mid', now() - interval '6 days'),
('11111111-1111-1111-1111-111111111105','Hardware Test Intern','Electronics','Support the validation team in testing new controller boards.',ARRAY['Run test procedures','Log and report defects','Assist with lab setup'],ARRAY['Pursuing ECE/EEE degree','Basic electronics lab skills'],ARRAY['Electronics','Lab Testing','Documentation'],ARRAY['Stipend','Mentorship','Certificate'],'internship','on-site','Hyderabad, India',180000,300000,'intern', now() - interval '12 days'),
('11111111-1111-1111-1111-111111111106','Marketing Intern','Marketing','Assist campaign teams with content, research and reporting.',ARRAY['Draft campaign copy','Compile performance reports','Research competitors'],ARRAY['Strong writing skills','Interest in digital marketing'],ARRAY['Copywriting','SEO','Analytics'],ARRAY['Stipend','Flexible schedule','Mentorship'],'internship','hybrid','Delhi, India',150000,250000,'intern', now() - interval '8 days'),
('11111111-1111-1111-1111-111111111106','Performance Marketing Specialist','Marketing','Own paid acquisition channels for consumer tech clients.',ARRAY['Plan and run paid campaigns','Optimise spend and ROAS','Report results to clients'],ARRAY['2+ years in paid media','Hands-on with ad platforms'],ARRAY['Google Ads','Meta Ads','Analytics','A/B Testing'],ARRAY['Performance bonus','Health insurance'],'part-time','remote','Remote',600000,1000000,'entry', now() - interval '14 days');