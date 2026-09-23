# Rutherford Calawagan

437-970-5862 · [rbcalawagan.ca@gmail.com](mailto:rbcalawagan.ca@gmail.com) · [LinkedIn](https://www.linkedin.com/in/rutherbc/) · [GitHub](https://github.com/charrmint)

## Education

### University of British Columbia

Bachelor of Computer Science · Vancouver, BC · Sep 2023 – Dec 2027 (expected)

3.8 GPA · Dean’s List

- Relevant coursework: Algorithms & Data Structures, Computer Systems, Software Construction, and Models of Computation.

## Work experience

### Trulioo

Software Engineer Intern · Vancouver, BC · May 2026 – Present

Improving service performance, observability, and modernization across .NET systems.

- Reduced peak memory use by **80.4%** and encryption/decryption time by **50%** in an internal encryption library by precomputing message size and replacing intermediate streams with one preallocated buffer.

- Instrumented **5 workflows and 52 stages** with step-level execution timing, using AsyncLocal and an accessor abstraction to propagate context through asynchronous processing.

- Reduced disk usage by **80%** across **9 services** by standardizing NLog retention and correcting archive rotation across date boundaries.

- Automated .NET 8-to-10 modernization across **7 services**, updated **20+ dependencies**, and remediated **30+ vulnerabilities** with a reusable coding-agent SKILL that generated review-ready merge requests.

### Procurify

Software Engineer Intern · Vancouver, BC · Sep 2025 – Apr 2026

Faster exports, lower memory use, and more reliable integration workflows, alongside customer-facing React features.

- Cut database calls by **99% (3,200+ to 14)** and request latency by **25%** by removing N+1 SQL queries and introducing batched data retrieval.

- Reduced peak memory use by **84% (1.55 GB to 253 MB)** in the audit-log version-history pipeline by restructuring version-history construction around ID-based batching.

- Eliminated a race condition in integration-status updates through row-level locking with PonyORM’s `get_for_update()`.

- Shipped React features and supporting APIs for account management and troubleshooting, collaborating with senior engineers, product, and design.

### University of British Columbia

Software Development – Research Assistant · Vancouver, BC · Apr 2025 – Jul 2025

AI in finance: reproducing a published machine-learning preprocessing pipeline.

- Replicated a published pipeline across 5-day and 60-day horizons. Accelerated 60-day preprocessing by approximately **25%** by reusing parsed market data and normalized price arrays.

Reference paper: [(Re-)Imag(in)ing Price Trends](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3756587)

## Projects

### Rep-Pilot

Mobile-first workout tracking & progression · Jun 2026 – Aug 2026

Plan reusable workouts, record every set, and get explainable recommendations for what to lift next.

Built a mobile-first workout platform with Next.js and TypeScript and a normalized PostgreSQL schema for templates, sessions, exercises, and set-level history. Engineered deterministic progression with pain overrides, stall detection, and reproducible recommendations; enforced per-user isolation through Supabase row-level security. An OpenAI explanation layer is planned and not yet implemented.

[Live app](https://rep-pilot.vercel.app/)

### FoodRadar

Food inventory & camera-assisted scanning · Apr 2025

An expanded hackathon-built MERN prototype for keeping track of food inventory through manual entry and camera-assisted recognition.

Worked mainly on the backend in a four-member team at BCS Hackathons. After the hackathon, refined the UX and added authentication to the MERN inventory application, which includes Google Cloud Vision scanning.

[GitHub](https://github.com/charrmint/FoodRadar)

## Leadership & additional experience

### UBC BCSSA

Professional Committee · Jan 2026 – Present

Helping BCS students connect with career-development opportunities.

- Coordinate career-development events for BCS students, managing speaker outreach, logistics, and promotion in partnership with the VP Professional.

### Unilever

Future Leaders Program – Supply Chain · Aug 2021 – Jul 2024

A three-year management rotation across Integrated Planning, Manufacturing, Customer Service, and Logistics.

- Delivered cross-functional projects, including a Python and Power BI tool that increased service level from **78% to 90%**.

## Technical skills

**Languages:** C#, Python, TypeScript / JavaScript, Java, C++, SQL, HTML / CSS.

**Frameworks:** .NET, React, Next.js, Django, FastAPI, Node.js / Express.

**Cloud & tools:** AWS (ECS, S3, RDS, SQS, Kinesis Data Streams), Docker, Bash, Git, GitHub, GitLab, CircleCI.

**Databases & observability:** PostgreSQL, MySQL, MongoDB, Grafana, Kibana, Loki.
