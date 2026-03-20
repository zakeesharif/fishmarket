-- ============================================================
-- Seaitall Seed Data  (v2 — FK-safe)
-- ============================================================
-- Run this in your Supabase SQL Editor.
-- Uses session_replication_role to bypass FK constraints so we
-- don't need real auth.users entries for seed profiles.
-- The anon SELECT policy (using: true) means all listings show
-- on the browse page without any login required.
-- ============================================================

-- ── Wipe any previous seed attempt ──────────────────────────

-- ── Bypass FK validation for seeding ────────────────────────
SET session_replication_role = replica;


-- ── 1. Profiles ─────────────────────────────────────────────

insert into public.profiles (id, username, bio, created_at) values
  ('aaaaaaaa-0000-0000-0000-000000000001', 'SurfCaster_Mike',
   'Surf fishing the south shore of Long Island since 1998. Stripers, blues, and weakfish. Sell what I upgrade, buy what I can''t resist.',
   now() - interval '45 days'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'CaptreeDave',
   'Captree State Park regular. Party boat captain by trade, obsessive tackle collector by nature. Fish hard, sell fair.',
   now() - interval '60 days'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'FlyFisher_Jane',
   'Cape Cod native. Fly fishing stripers and false albacore on the flats. Orvis-certified casting instructor.',
   now() - interval '30 days'),
  ('aaaaaaaa-0000-0000-0000-000000000004', 'OffshoreKing_Rob',
   'Miami-based offshore nut. Mahi, tuna, swordfish. Have owned more boats than I''d like to admit.',
   now() - interval '90 days'),
  ('aaaaaaaa-0000-0000-0000-000000000005', 'BaitBucket_Lou',
   'Tampa Bay inshore guide. Snook, redfish, trout. My wife says I have too much gear. She''s right.',
   now() - interval '75 days'),
  ('aaaaaaaa-0000-0000-0000-000000000006', 'TroutSlayer99',
   'Upstate NY trout bum turned bass addict. Tournament angler, weekend warrior, full-time tackle junkie.',
   now() - interval '50 days'),
  ('aaaaaaaa-0000-0000-0000-000000000007', 'RedSnapper_Rex',
   'New Orleans charter captain. Gulf Coast bottom fishing specialist. Selling off gear from my last boat refit.',
   now() - interval '120 days'),
  ('aaaaaaaa-0000-0000-0000-000000000008', 'KayakAngler_Kim',
   'Kayak fishing around Cape Cod Bay and Buzzards Bay. Light tackle everything. Pedal drive convert.',
   now() - interval '20 days'),
  ('aaaaaaaa-0000-0000-0000-000000000009', 'BlueWater_Pete',
   'San Diego tuna guy. Bluefin, yellowfin, yellowtail. Also chase calico bass inshore when the offshore bite is slow.',
   now() - interval '80 days'),
  ('aaaaaaaa-0000-0000-0000-000000000010', 'TackleHoard_Sal',
   'Montauk local. 30 years of striper obsession has left me with more tackle than any one man needs. Clearing out to fund the next addiction.',
   now() - interval '35 days');


-- ── 2. Listings ─────────────────────────────────────────────

insert into public.listings
  (id, user_id, seller_email, title, description, price, condition, category, location, created_at)
values

-- ── RODS (8) ────────────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000001', 'surfcaster.mike@gmail.com',
 'Penn Battalion II Surf Rod 10''6" Heavy',
 'Workhorse surf rod that''s done serious duty on the south shore. Action is still perfect — no cracks, guides are clean, no tip damage. I switched to the St. Croix Mojo Surf so this one needs a new home. Rated 2-6oz, handles bunker chunks and big metal just fine. Comes with the original sleeve.',
 79.00, 'Good', 'Rods', 'Captree, NY',
 now() - interval '3 days'),

('bbbbbbbb-0000-0000-0000-000000000002',
 'aaaaaaaa-0000-0000-0000-000000000006', 'troutslayer99@gmail.com',
 'St. Croix Mojo Bass MBC70MHF 7''0" Casting Rod',
 'Bought this for tournament season last year, switched to the Mojo Bass Glass for cranking. Sensitivity is off the charts for its price point. Barely used — maybe 10 trips. No scratches on the blank, Fuji guides are perfect. Comes with original rod sock.',
 105.00, 'Like New', 'Rods', 'Montauk, NY',
 now() - interval '7 days'),

('bbbbbbbb-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000007', 'redsnapper.rex@gmail.com',
 'G. Loomis NRX+ Inshore Spinning Rod 7''3" MH',
 'Upgraded to the Conquest so the NRX+ is available. This rod is stupid light and stupid sensitive — you''ll feel every tap. Used maybe two full seasons of inshore Gulf fishing. One small cosmetic scratch near the reel seat, nothing structural. Still fishes like the day I bought it. $520 new.',
 385.00, 'Good', 'Rods', 'New Orleans, LA',
 now() - interval '12 days'),

('bbbbbbbb-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000005', 'baitbucket.lou@gmail.com',
 'Shimano Teramar Southeast Spinning 7''6" Med-Heavy',
 'Purpose-built for Tampa Bay inshore. I''ve put snook, redfish, and more than a few tarpon on this stick. Rod is in great shape — I''m meticulous with my gear. Just adding a second Teramar to the rotation and don''t need two of this length. Rated 10-20lb.',
 155.00, 'Like New', 'Rods', 'Tampa, FL',
 now() - interval '5 days'),

('bbbbbbbb-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000008', 'kayak.kim@gmail.com',
 'Ugly Stik Elite Spinning Rod 6''6" Medium',
 'Great starter/backup rod that I used on the kayak before upgrading. The tip is nearly indestructible — took a few unexpected dunks with it and it came out fine every time. Some cosmetic wear on the blank from normal use, but the guides are clean and it casts perfectly. Good buy for anyone.',
 32.00, 'Fair', 'Rods', 'Cape Cod, MA',
 now() - interval '18 days'),

('bbbbbbbb-0000-0000-0000-000000000006',
 'aaaaaaaa-0000-0000-0000-000000000009', 'bluewater.pete@gmail.com',
 'Temple Fork TFO Blue Ribbon Fly Rod 9'' 8wt 4pc',
 'San Diego has surprisingly good striper fly fishing and I chased that rabbit for a year. Sold the skiff, no longer need the rod. TFO is criminally underrated — this blank is fast, accurate, handles wind well. Used maybe 15 days. Comes with the original tube and sock.',
 195.00, 'Like New', 'Rods', 'San Diego, CA',
 now() - interval '9 days'),

('bbbbbbbb-0000-0000-0000-000000000007',
 'aaaaaaaa-0000-0000-0000-000000000010', 'tacklehoard.sal@gmail.com',
 'Daiwa Saltiga Surf Rod 14'' 6-12oz',
 'Big-water surf rod built for serious distance casting. I used this for Montauk fall run — chunking bunker for big cow stripers. It''s an absolute cannon. Downsizing the surf setup, keeping just one rod. Some minor salt staining near the reel seat that''s cosmetic only. Original bag included.',
 210.00, 'Good', 'Rods', 'Montauk, NY',
 now() - interval '22 days'),

('bbbbbbbb-0000-0000-0000-000000000008',
 'aaaaaaaa-0000-0000-0000-000000000003', 'flyfisher.jane@gmail.com',
 'Orvis Recon 9'' 9wt Fly Rod — Striper / Bluewater',
 'This is the rod I learned to throw big flies with. Four piece, fast action, handles 400-grain lines without complaint. I upgraded to the Helios 3 so the Recon is looking for a new home. Minimal use — maybe 20 days on Cape Cod flats and a trip to Monomoy. Includes original rod tube.',
 365.00, 'Like New', 'Rods', 'Cape Cod, MA',
 now() - interval '2 days'),


-- ── REELS (8) ───────────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000009',
 'aaaaaaaa-0000-0000-0000-000000000001', 'surfcaster.mike@gmail.com',
 'Penn Battle III 5000 Spinning Reel',
 'Bulletproof surf reel. I put this through three full striper seasons and it still cranks smooth. Full metal body, HT-100 drag is silky. Cleaned and re-greased after every season. Some minor cosmetic scratching on the bail arm — nothing functional. Spooled with 30lb braid if you want it.',
 88.00, 'Good', 'Reels', 'Captree, NY',
 now() - interval '4 days'),

('bbbbbbbb-0000-0000-0000-000000000010',
 'aaaaaaaa-0000-0000-0000-000000000005', 'baitbucket.lou@gmail.com',
 'Shimano Stradic FL 4000 Spinning Reel',
 'Used one inshore season, then I went to baitcasters full time. This reel is essentially mint — Hagane body, X-Shield, CI4+ rotor. Smooth doesn''t cover it. Currently spooled with 20lb Sufix 832. Includes original box and spare spool. $250 retail.',
 195.00, 'Like New', 'Reels', 'Tampa, FL',
 now() - interval '6 days'),

('bbbbbbbb-0000-0000-0000-000000000011',
 'aaaaaaaa-0000-0000-0000-000000000010', 'tacklehoard.sal@gmail.com',
 'Van Staal VR75 Spinning Reel — Waterproof',
 'The gold standard of surf reels. Fully sealed and waterproof. I have dunked this reel completely underwater and it kept right on spinning. Used three seasons of hard Montauk surf fishing. Drag is still buttery. Machined aluminum body, no wobble whatsoever. $550 new.',
 395.00, 'Good', 'Reels', 'Montauk, NY',
 now() - interval '14 days'),

('bbbbbbbb-0000-0000-0000-000000000012',
 'aaaaaaaa-0000-0000-0000-000000000006', 'troutslayer99@gmail.com',
 'Abu Garcia Revo Toro Beast 50 Low Profile Baitcaster',
 'Tournament-grade baitcaster built for heavy cover. 5.4:1 gear ratio, 30lb drag, power stack carbon matrix drag system. I ran this on a punching setup all last season. Cleaned and serviced at the end of the season. Casts smooth, no vibration. Comes with box and wrenches.',
 165.00, 'Like New', 'Reels', 'Montauk, NY',
 now() - interval '11 days'),

('bbbbbbbb-0000-0000-0000-000000000013',
 'aaaaaaaa-0000-0000-0000-000000000007', 'redsnapper.rex@gmail.com',
 'Daiwa BG 5000 Spinning Reel',
 'Great workhorse inshore/nearshore reel. I used this on a 7-foot med-heavy for snapper and redfish out of New Orleans. Aluminum housing, ATD drag, infinite anti-reverse. It''s a little scratched up from fishing but mechanically it''s perfect. Drag is smooth, bail is crisp. Good value.',
 72.00, 'Good', 'Reels', 'New Orleans, LA',
 now() - interval '19 days'),

('bbbbbbbb-0000-0000-0000-000000000014',
 'aaaaaaaa-0000-0000-0000-000000000009', 'bluewater.pete@gmail.com',
 'Okuma Cedros CJ-60S High-Speed Spinning Reel',
 'Jig reel built for speed. 6.2:1 ratio, great for fast iron jigging off the kelp beds. I used this for two seasons on the San Diego yellows. Does have some wear on the rotor from the rocks — functionally 100%, just not pretty. Freshwater rinsed after every trip. Priced to move.',
 55.00, 'Fair', 'Reels', 'San Diego, CA',
 now() - interval '25 days'),

('bbbbbbbb-0000-0000-0000-000000000015',
 'aaaaaaaa-0000-0000-0000-000000000002', 'captree.dave@gmail.com',
 'Penn Squall 30LD Lever Drag Conventional Reel',
 'Classic party boat reel. Penn Squall 30 with lever drag — perfect for party boat cod and seabass fishing out of Captree. I had two of these and I''m keeping one. This one has been used a handful of times and is in great shape. Line counter works, drag is smooth all the way through.',
 115.00, 'Good', 'Reels', 'Captree, NY',
 now() - interval '8 days'),

('bbbbbbbb-0000-0000-0000-000000000016',
 'aaaaaaaa-0000-0000-0000-000000000004', 'offshore.rob@gmail.com',
 'Shimano Talica 16 Two-Speed Conventional Reel',
 'Offshore workhorse. Two-speed, 40lb drag, X-Ship gearing that stays smooth under load. I''ve put swordfish and big tuna on this reel. Serviced annually by a Shimano dealer. A couple of cosmetic marks but it functions like new. Comes with factory box and tools. $480 retail.',
 320.00, 'Good', 'Reels', 'Miami, FL',
 now() - interval '16 days'),


-- ── LURES (6) ───────────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000017',
 'aaaaaaaa-0000-0000-0000-000000000002', 'captree.dave@gmail.com',
 'Storm Kickin'' Minnow Lot — 9 lures, 4.5" & 5.5"',
 'Cleaned out a tray from my tackle bag. Nine Kickin'' Minnows in total — mix of Loaded Olive/White Belly, Silver/Black Back, and Chartreuse. All hooks intact, most still have original split rings. A few have minor paint chips from fish teeth which is normal. These things are striper magnets off Captree.',
 30.00, 'Good', 'Lures', 'Captree, NY',
 now() - interval '1 day'),

('bbbbbbbb-0000-0000-0000-000000000018',
 'aaaaaaaa-0000-0000-0000-000000000008', 'kayak.kim@gmail.com',
 'Hogy Epoxy Jig 3oz — 4 colors, barely used',
 'Four Hogy epoxy jigs in 3oz. Colors: White, Chartreuse, Pink, and Sand Eel. Bought these for false albacore season and got skunked. Lures were wetted but no fish were caught. Hooks are factory-fresh. These are some of the most effective Cape Cod and Vineyard jigs for albies and stripers.',
 48.00, 'Like New', 'Lures', 'Cape Cod, MA',
 now() - interval '3 days'),

('bbbbbbbb-0000-0000-0000-000000000019',
 'aaaaaaaa-0000-0000-0000-000000000005', 'baitbucket.lou@gmail.com',
 'Rapala X-Rap Slashbait XR10 — 7 lures assorted',
 'Seven X-Rap 10s I accumulated over a few years of Tampa Bay fishing. Colors: Olive, Sardine, Silver, Mullet, Clown, Firetiger, and Glass Ghost. All have original trebles — some are rusty so I''d swap them out. Bodies are in great shape. Deadly on trout, snook, and reds.',
 42.00, 'Good', 'Lures', 'Tampa, FL',
 now() - interval '15 days'),

('bbbbbbbb-0000-0000-0000-000000000020',
 'aaaaaaaa-0000-0000-0000-000000000009', 'bluewater.pete@gmail.com',
 'Shimano Butterfly Flat-Fall Jig 150g — 3 pack',
 'Three Shimano Butterfly Flat-Fall jigs in 150g. Blue Pink, Glow Zebra, and Sardine. These are the real deal for slow-pitch jigging — watch them flutter on the drop and the yellows go nuts. Used maybe 3 trips total, hooks are still sharp. San Diego kelp beds proven.',
 68.00, 'Like New', 'Lures', 'San Diego, CA',
 now() - interval '10 days'),

('bbbbbbbb-0000-0000-0000-000000000021',
 'aaaaaaaa-0000-0000-0000-000000000003', 'flyfisher.jane@gmail.com',
 'Enrico Puglisi Striper Flies — 12 fly assortment',
 'A dozen EP flies sized for Cape Cod striper fishing. Mix of menhaden patterns, sand eel patterns, and a couple of crab flies. All hand-tied, minimal use — most fished once or twice. A few have water staining but the materials are intact. Perfect starter striper fly box.',
 55.00, 'Good', 'Lures', 'Cape Cod, MA',
 now() - interval '6 days'),

('bbbbbbbb-0000-0000-0000-000000000022',
 'aaaaaaaa-0000-0000-0000-000000000007', 'redsnapper.rex@gmail.com',
 'Strike King Red Eye Shad 1/2oz — 10 pack mixed colors',
 'Ten Red Eye Shads in assorted Gulf-proven colors: Sexy Shad, Chrome Sexy Shad, Chartreuse Shad, Bluegill, and Citrus Shad. A few have the paint rubbed off from fish and rocks but they still rattle and swim. Good lot for someone fishing Toledo Bend or the Atchafalaya.',
 26.00, 'Good', 'Lures', 'New Orleans, LA',
 now() - interval '20 days'),


-- ── TACKLE BOXES (4) ────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000023',
 'aaaaaaaa-0000-0000-0000-000000000002', 'captree.dave@gmail.com',
 'Plano 3700 Tackle System — 4 trays loaded with terminal',
 'Four loaded Plano 3700 trays inside a Plano guide bag. Contents: Mustad Demon Perfect Circle hooks (1/0–5/0), Owner SSW hooks, various bucktails 1–3oz, split rings, barrel swivels, snap swivels, fluorocarbon leaders pre-tied, and a mix of sinkers 1–6oz. Party boat tested. Selling the whole system.',
 72.00, 'Good', 'Tackle Boxes', 'Captree, NY',
 now() - interval '5 days'),

('bbbbbbbb-0000-0000-0000-000000000024',
 'aaaaaaaa-0000-0000-0000-000000000005', 'baitbucket.lou@gmail.com',
 'Flambeau Outdoors 5007 Tackle Backpack — fully loaded',
 'Guide-grade tackle bag used for two seasons of inshore guiding. Six removable 3600 Plano trays loaded with inshore terminal: Owner ST-36 trebles, Trokar EWG hooks, wire leaders, snap swivels, rattling corks, popping corks, Carolina rigs, jig heads 1/8–1/2oz. Bag itself is in perfect condition.',
 95.00, 'Like New', 'Tackle Boxes', 'Tampa, FL',
 now() - interval '13 days'),

('bbbbbbbb-0000-0000-0000-000000000025',
 'aaaaaaaa-0000-0000-0000-000000000008', 'kayak.kim@gmail.com',
 'Plano EDGE 3500 Waterproof Utility Box',
 'Waterproof tackle box perfect for kayak fishing. These EDGE boxes are genuinely waterproof — I''ve had mine submerged. This one has light scratching on the lid but seals perfectly. Inside: jig heads, assist hooks, and a few stinger rigs. Buyers can keep or ditch the contents.',
 28.00, 'Good', 'Tackle Boxes', 'Cape Cod, MA',
 now() - interval '17 days'),

('bbbbbbbb-0000-0000-0000-000000000026',
 'aaaaaaaa-0000-0000-0000-000000000010', 'tacklehoard.sal@gmail.com',
 'Montauk Fall Run Surf Box — Plano 3700 Deep x3 in soft bag',
 'Three deep Plano 3700s in a Rapala soft tackle bag. Contents: pencil poppers (2oz, 3oz), Danny plugs, bottle plugs, swimmer plugs, Hopkins spoons, and Gibbs hardware collected over the years. All real Gibbs, no knockoffs. A working Montauk striper plug collection. Nothing fancy, all fish-catchers.',
 145.00, 'Good', 'Tackle Boxes', 'Montauk, NY',
 now() - interval '26 days'),


-- ── BOATS (2) ───────────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000027',
 'aaaaaaaa-0000-0000-0000-000000000004', 'offshore.rob@gmail.com',
 '2018 Mako 184 CC Center Console — Twin Yamaha F115s',
 'Selling my Mako 184 to fund an upgrade. Twin Yamaha F115 four-strokes with around 320 hours each. Hull is clean — no blisters, no cracks. Recently had a full bottom job, new impellers, and zincs replaced. Live well works, console electronics include a Garmin ECHOMAP 74sv, VHF radio, and trim tabs. Kept on a lift in Miami so no trailer rust. Serious buyers only, sea trial available.',
 34500.00, 'Good', 'Boats', 'Miami, FL',
 now() - interval '28 days'),

('bbbbbbbb-0000-0000-0000-000000000028',
 'aaaaaaaa-0000-0000-0000-000000000002', 'captree.dave@gmail.com',
 '2016 Grady-White Tournament 192 — Single Yamaha F150',
 'Well-loved Captree workhorse. Grady-White quality speaks for itself. F150 four-stroke has 480 hours — runs strong, compression tested this spring. Live well, rod holders, outrigger mounts, T-top, Lowrance HDS-7 on the helm. Hull has some bottom paint fade and a small gelcoat repair on the port bow from a dock rub. Comes with single-axle trailer.',
 18900.00, 'Fair', 'Boats', 'Captree, NY',
 now() - interval '30 days'),


-- ── ENGINES (2) ─────────────────────────────────────────────

('bbbbbbbb-0000-0000-0000-000000000029',
 'aaaaaaaa-0000-0000-0000-000000000004', 'offshore.rob@gmail.com',
 '2021 Yamaha F115 Four-Stroke Outboard — 210 Hours',
 'Pulling one of the twin F115s off my Mako as I''m going to a single larger engine. This motor has 210 hours, full service history — Yamaha dealer serviced every 100 hours. Fresh impeller, fresh lower unit fluid. Starts on the first crank every time. No corrosion on the cowl, powerhead is immaculate. Can arrange freight shipping.',
 8400.00, 'Like New', 'Engines', 'Miami, FL',
 now() - interval '10 days'),

('bbbbbbbb-0000-0000-0000-000000000030',
 'aaaaaaaa-0000-0000-0000-000000000001', 'surfcaster.mike@gmail.com',
 '2019 Mercury 90 ELPT EFI Four-Stroke — 340 Hours',
 'Came off my old 19'' Mako when I sold it. Solid motor, no issues. 340 hours but these EFI Mercurys go forever with proper maintenance — all service records available. Lower unit seals are good, no water in oil. Starts and runs great. Just sitting in my garage taking up space. Pickup from Captree only.',
 4800.00, 'Good', 'Engines', 'Captree, NY',
 now() - interval '21 days');


-- ── 3. Message Threads ──────────────────────────────────────

insert into public.messages
  (id, sender_id, recipient_id, listing_id, content, read, created_at)
values

-- Thread 1: Mike → Dave about Storm Kickin' Minnows
('cccccccc-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000002',
 'bbbbbbbb-0000-0000-0000-000000000017',
 'Hey Dave — are the 5.5" ones included in this lot? That''s what I run off Captree in the fall. Any Olive/White in there?',
 true, now() - interval '1 day' - interval '4 hours'),

('cccccccc-0000-0000-0000-000000000002',
 'aaaaaaaa-0000-0000-0000-000000000002',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'bbbbbbbb-0000-0000-0000-000000000017',
 'Yep, mix of both sizes. Got 4 of the 5.5" in there. Two Olive/White, one Silver/Black, one Chartreuse. You know how good these are on the south shore — grab ''em.',
 true, now() - interval '1 day' - interval '2 hours'),

('cccccccc-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000002',
 'bbbbbbbb-0000-0000-0000-000000000017',
 'Perfect, I''ll take them. Can I meet you at the Captree parking lot Saturday morning? Usually there by 5am.',
 false, now() - interval '20 hours'),

-- Thread 2: Pete → Rob about the Mako
('cccccccc-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000009',
 'aaaaaaaa-0000-0000-0000-000000000004',
 'bbbbbbbb-0000-0000-0000-000000000027',
 'Rob — serious interest in the Mako. What''s the bottom paint situation? Are those the F115s or the newer 4.2L? Does the Garmin have charts loaded?',
 true, now() - interval '5 days' - interval '3 hours'),

('cccccccc-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000009',
 'bbbbbbbb-0000-0000-0000-000000000027',
 'They''re the F115s, 2018 build. Bottom was done in February with Interlux Micron CSC. Garmin has Florida and Bahamas BlueChart loaded. Hull is solid — surveyed before the refit last year, no soft spots. Worth flying down for a sea trial. I''m flexible on price for cash.',
 true, now() - interval '4 days' - interval '6 hours'),

('cccccccc-0000-0000-0000-000000000006',
 'aaaaaaaa-0000-0000-0000-000000000009',
 'aaaaaaaa-0000-0000-0000-000000000004',
 'bbbbbbbb-0000-0000-0000-000000000027',
 'That''s exactly what I needed to hear. Would $32,500 cash work? I can be in Miami the weekend of the 22nd.',
 true, now() - interval '3 days' - interval '2 hours'),

('cccccccc-0000-0000-0000-000000000007',
 'aaaaaaaa-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000009',
 'bbbbbbbb-0000-0000-0000-000000000027',
 'Let''s do it. $32,500 works. Come Saturday the 22nd — I''ll have her in the water at Dinner Key Marina. Text me when you land.',
 false, now() - interval '2 days'),

-- Thread 3: TroutSlayer → Kim about Hogy jigs
('cccccccc-0000-0000-0000-000000000008',
 'aaaaaaaa-0000-0000-0000-000000000006',
 'aaaaaaaa-0000-0000-0000-000000000008',
 'bbbbbbbb-0000-0000-0000-000000000018',
 'Kim — are these the standard Hogy epoxy jigs or the heavy versions? Asking because I want to use them in current on the Cape in September.',
 true, now() - interval '2 days' - interval '5 hours'),

('cccccccc-0000-0000-0000-000000000009',
 'aaaaaaaa-0000-0000-0000-000000000008',
 'aaaaaaaa-0000-0000-0000-000000000006',
 'bbbbbbbb-0000-0000-0000-000000000018',
 'Standard 3oz. Perfect for the rips around the Cape — used them at Nauset and Race Point. White is the money color around here. All four hooks are factory sharp. Honestly these just didn''t match my rod setup so they barely got wet.',
 false, now() - interval '1 day'),

-- Thread 4: Jane → Mike about the Penn Battalion
('cccccccc-0000-0000-0000-000000000010',
 'aaaaaaaa-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'bbbbbbbb-0000-0000-0000-000000000001',
 'Mike — what''s the casting weight on that Battalion? I throw 3-4oz plugs on the Cape. Also how long is the handle?',
 true, now() - interval '2 days'),

('cccccccc-0000-0000-0000-000000000011',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000003',
 'bbbbbbbb-0000-0000-0000-000000000001',
 'Jane it''s rated 2-6oz so your 3-4oz plugs are right in the sweet spot. Handle is the standard two-handed cork grip, full 18" rear handle. Great rod for Cape work. Let me know if you want to meet somewhere.',
 false, now() - interval '1 day' - interval '3 hours'),

-- Thread 5: Lou → Sal about the Montauk surf box
('cccccccc-0000-0000-0000-000000000012',
 'aaaaaaaa-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000010',
 'bbbbbbbb-0000-0000-0000-000000000026',
 'Sal — what size are the pencil poppers? Are those real Gibbs plugs or knockoffs? Any Danny lures in there?',
 true, now() - interval '3 days'),

('cccccccc-0000-0000-0000-000000000013',
 'aaaaaaaa-0000-0000-0000-000000000010',
 'aaaaaaaa-0000-0000-0000-000000000005',
 'bbbbbbbb-0000-0000-0000-000000000026',
 'Real Gibbs, all of it. I don''t mess with knockoffs. Got three Danny lures in there — 2oz and 3oz. Pencil poppers are mostly 2oz and 3oz. This box has caught a lot of fish, Lou.',
 true, now() - interval '2 days' - interval '4 hours'),

('cccccccc-0000-0000-0000-000000000014',
 'aaaaaaaa-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000010',
 'bbbbbbbb-0000-0000-0000-000000000026',
 'Real Gibbs sold me. I''ll take it. Can you ship to Tampa or locals only? Happy to cover freight.',
 false, now() - interval '1 day' - interval '1 hour');


-- ── 4. Sample Catches ───────────────────────────────────────

insert into public.catches
  (id, user_id, species, weight_lbs, location, gear_used, photo_url, caption, created_at)
values

('dddddddd-0000-0000-0000-000000000001',
 'aaaaaaaa-0000-0000-0000-000000000001',
 'Striped Bass', 38.5, 'Montauk, NY',
 'Daiwa Saltiga 14'' + Van Staal VR75 spooled with 65lb braid',
 null,
 'Fall run cow striper on a bunker chunk. 38.5 lbs on the Boga. Released after a quick photo. The Montauk Point rip was on fire at first light.',
 now() - interval '2 days'),

('dddddddd-0000-0000-0000-000000000002',
 'aaaaaaaa-0000-0000-0000-000000000002',
 'Bluefish', 12.0, 'Captree, NY',
 'Penn Battle III 5000 on a 9'' heavy spinning rod',
 null,
 'Big chopper blue on a metal lip swimmer off the Captree inlet. 12 pounds of pure chaos. These things fight twice their weight.',
 now() - interval '5 days'),

('dddddddd-0000-0000-0000-000000000003',
 'aaaaaaaa-0000-0000-0000-000000000003',
 'False Albacore', 9.2, 'Cape Cod, MA',
 'Orvis Recon 9wt fly rod + Lamson Liquid reel, 30lb fluorocarbon leader',
 null,
 'Albie on a white Hogy epoxy jig. These fish are the fastest thing in the ocean — peeled 100 yards of backing in about 4 seconds. Pure joy on the fly rod.',
 now() - interval '8 days'),

('dddddddd-0000-0000-0000-000000000004',
 'aaaaaaaa-0000-0000-0000-000000000005',
 'Snook', 28.0, 'Tampa Bay, FL',
 'Shimano Stradic FL 4000 on a 7''6" Teramar MH',
 null,
 'Slot snook on a live pinfish under the bridge lights at midnight. Tampa Bay inshore fishing at its finest. Measured 34 inches — perfect size.',
 now() - interval '12 days'),

('dddddddd-0000-0000-0000-000000000005',
 'aaaaaaaa-0000-0000-0000-000000000004',
 'Mahi-Mahi', 22.5, 'Miami, FL',
 'Shimano Talica 16 on a heavy spinning setup, 40lb braid',
 null,
 'Bull mahi on a Shimano Butterfly flat-fall jig in 300 feet. Color absolutely lit up when it hit the surface. Best eating fish in the ocean.',
 now() - interval '3 days'),

('dddddddd-0000-0000-0000-000000000006',
 'aaaaaaaa-0000-0000-0000-000000000009',
 'Yellowfin Tuna', 54.0, 'San Diego, CA',
 'Okuma Cedros CJ-60S with 60lb braid on a 6''6" jig rod',
 null,
 'Big YFT on the iron at the Coronado Islands. Running iron in the kelp paddy bite — 54 pounds dressed out. These fish are something else on the fast iron.',
 now() - interval '15 days');


-- ── Restore FK enforcement ───────────────────────────────────
SET session_replication_role = DEFAULT;


-- ── Verify ──────────────────────────────────────────────────
select 'profiles' as table_name, count(*) as rows from public.profiles where id::text like 'aaaaaaaa%'
union all
select 'listings', count(*) from public.listings where id::text like 'bbbbbbbb%'
union all
select 'messages', count(*) from public.messages where id::text like 'cccccccc%';
