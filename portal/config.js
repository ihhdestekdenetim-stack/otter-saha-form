// OTTER Saha Portal — Supabase bağlantısı.
// Publishable (anon) key PUBLIC'tir; güvenlik tamamen RLS + oturum (login) ile sağlanır.
// Form güncellenince form-schema.js tazelenir (web-fill / mobil_apk'dan kopyalanır).
var SUPABASE_URL   = "https://kmwimegtasucaswcmgoo.supabase.co";
var SUPABASE_KEY   = "sb_publishable_e-Xu14yqa2eVirJctNYr0w_W4yd_ubb";
var EMAIL_DOMAIN   = "otter.local";          // kullanıcı adı → <ad>@otter.local (sanal e-posta)
var TBL_RESPONSES  = "field_responses";
var TBL_REVISIONS  = "feas_revisions";

// Fizibilite revizyon alanlarının Türkçe etiketleri (OTTER config ile aynı).
var REVISABLE_LABELS = {
  raw_coord: "Koordinat", country: "Ülke", city: "Şehir", town: "İlçe / Bölge",
  village: "Köy", population: "Bölge Nüfusu", households: "Hane Sayısı",
  beneficiaries: "Faydalanan Kişi Sayısı", land_owner: "Arazi Sahipliği", notes: "Notlar"
};
