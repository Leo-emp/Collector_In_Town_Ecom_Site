-- ===================================================================
-- Collector In Town — Seed Data
-- Sample products, delivery zones, and site settings for development
-- ===================================================================

-- Delivery zones for Myanmar domestic shipping
insert into public.delivery_zones (zone_name, cities, fee, estimated_time) values
  ('Yangon', '{"Yangon","Thanlyin","Dagon","Hlaing","Insein","Mingaladon","Shwepyitha","North Okkalapa","South Okkalapa","Tamwe","Bahan","Sanchaung","Kamayut","Mayangone","Yankin","Thingangyun"}', 2000, '1-2 business days'),
  ('Mandalay', '{"Mandalay","Amarapura","Chanmyathazi","Pyigyidagun","Monywa"}', 3500, '2-3 business days'),
  ('Naypyidaw', '{"Naypyidaw","Pyinmana","Tatkon"}', 3000, '2-3 business days'),
  ('Other', '{}', 5000, '3-5 business days');

-- Free shipping threshold — orders above 50,000 Ks ship free
insert into public.site_settings (key, value) values
  ('free_shipping_threshold', '50000');

-- Sample products — 2 per brand (8 total)
insert into public.products (name_en, name_my, slug, brand, scale, price, description_en, description_my, photos, stock_count, status) values
  (
    'Nissan GT-R R35 Liberty Walk',
    'နစ်ဆန် GT-R R35 Liberty Walk',
    'nissan-gtr-r35-liberty-walk',
    'mini-gt', '1:64', 45000,
    'Mini GT 1:64 scale Nissan GT-R R35 with Liberty Walk body kit. Metallic blue finish with detailed interior and opening doors.',
    'Mini GT 1:64 စကေး နစ်ဆန် GT-R R35 Liberty Walk ကိုယ်ထည်ကစ်ပါ။ အပြာရောင် metallic finish ဖြင့် အတွင်းပိုင်းအသေးစိတ်ပါ။',
    '{}', 15, 'active'
  ),
  (
    'Porsche 911 GT3 RS',
    'ပေါ့ရှ 911 GT3 RS',
    'porsche-911-gt3-rs',
    'mini-gt', '1:64', 52000,
    'Mini GT 1:64 Porsche 911 GT3 RS in Guards Red. Opening hood reveals detailed flat-six engine.',
    'Mini GT 1:64 ပေါ့ရှ 911 GT3 RS Guards Red အနီရောင်။ ဟွဒ်ဖွင့်လျှင် flat-six အင်ဂျင်ပါ။',
    '{}', 8, 'active'
  ),
  (
    'Toyota AE86 Sprinter Trueno',
    'တိုယိုတာ AE86 Sprinter Trueno',
    'toyota-ae86-sprinter-trueno',
    'hot-wheels', '1:64', 12000,
    'Hot Wheels premium Toyota AE86 from the Japan Historics series. White and black panda colorway with Real Riders rubber tires.',
    'Hot Wheels ပရီမီယံ တိုယိုတာ AE86 Japan Historics စီးရီး။ Panda အရောင်ဖြင့် Real Riders ရာဘာတာယာများပါ။',
    '{}', 25, 'active'
  ),
  (
    'Mazda RX-7 FD3S Spirit R',
    'မဇ်ဒါ RX-7 FD3S Spirit R',
    'mazda-rx7-fd3s-spirit-r',
    'hot-wheels', '1:64', 15000,
    'Hot Wheels premium Mazda RX-7 FD3S Spirit R in brilliant red. Real Riders rubber tires and detailed rotary engine.',
    'Hot Wheels ပရီမီယံ မဇ်ဒါ RX-7 FD3S Spirit R အနီရောင်။ Real Riders ရာဘာတာယာများနှင့် rotary အင်ဂျင်ပါ။',
    '{}', 20, 'active'
  ),
  (
    'Honda Civic Type-R EK9',
    'ဟွန်ဒါ Civic Type-R EK9',
    'honda-civic-type-r-ek9',
    'inno64', '1:64', 38000,
    'Inno64 Honda Civic Type-R EK9 in Championship White. Highly detailed with opening hood and Mugen accessories.',
    'Inno64 ဟွန်ဒါ Civic Type-R EK9 Championship White အဖြူရောင်။ ဟွဒ်ဖွင့်နိုင်ပြီး Mugen ဆက်စပ်ပစ္စည်းများပါ။',
    '{}', 10, 'active'
  ),
  (
    'Mitsubishi Lancer Evolution III',
    'မစ်ဆူဘီရှီ Lancer Evolution III',
    'mitsubishi-lancer-evo-iii',
    'inno64', '1:64', 42000,
    'Inno64 Mitsubishi Lancer Evolution III in Dandelion Yellow. Rally-spec with roof scoop and Enkei wheels.',
    'Inno64 မစ်ဆူဘီရှီ Lancer Evolution III Dandelion Yellow အဝါရောင်။ Rally-spec ဖြင့် roof scoop နှင့် Enkei ဘီးများပါ။',
    '{}', 6, 'active'
  ),
  (
    'Nissan Skyline GT-R R34 V-Spec II',
    'နစ်ဆန် Skyline GT-R R34 V-Spec II',
    'nissan-skyline-gtr-r34-vspec-ii',
    'pop-race', '1:64', 35000,
    'Pop Race Nissan Skyline GT-R R34 V-Spec II in Bayside Blue. Chrome Nismo bumper, detailed undercarriage, and Brembo brakes.',
    'Pop Race နစ်ဆန် Skyline GT-R R34 V-Spec II Bayside Blue အပြာရောင်။ Chrome Nismo bumper နှင့် Brembo ဘရိတ်များပါ။',
    '{}', 12, 'active'
  ),
  (
    'Toyota Supra A80 TRD',
    'တိုယိုတာ Supra A80 TRD',
    'toyota-supra-a80-trd',
    'pop-race', '1:64', 32000,
    'Pop Race Toyota Supra A80 with TRD 3000GT wing in Super White II. Recaro interior and Rays TE37 wheels.',
    'Pop Race တိုယိုတာ Supra A80 TRD 3000GT wing Super White II အဖြူရောင်။ Recaro အတွင်းပိုင်းနှင့် Rays TE37 ဘီးများပါ။',
    '{}', 18, 'active'
  );
