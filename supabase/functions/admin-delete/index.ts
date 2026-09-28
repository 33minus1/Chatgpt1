import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const authorization = req.headers.get("Authorization") ?? "";

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !authorization) {
    return json({ error: "درخواست معتبر نیست." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const requester = userData.user;
  if (userError || !requester) return json({ error: "ابتدا وارد حساب مدیریت شوید." }, 401);

  const { data: isAdmin, error: adminError } = await userClient.rpc("is_admin");
  if (adminError || !isAdmin) return json({ error: "دسترسی مدیریت تأیید نشد." }, 403);

  let payload: { kind?: "job" | "company" | "user"; id?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "اطلاعات درخواست ناقص است." }, 400);
  }

  const kind = payload.kind;
  const id = payload.id?.trim();
  if (!kind || !id || !["job", "company", "user"].includes(kind)) {
    return json({ error: "نوع یا شناسه حذف معتبر نیست." }, 400);
  }

  if (kind === "job") {
    const { data, error } = await serviceClient.from("jobs").delete().eq("id", id).select("id").maybeSingle();
    if (error) return json({ error: "حذف آگهی انجام نشد." }, 400);
    if (!data) return json({ error: "آگهی پیدا نشد." }, 404);
    return json({ ok: true, kind, id });
  }

  if (kind === "company") {
    const { data, error } = await serviceClient.from("companies").delete().eq("id", id).select("id").maybeSingle();
    if (error) return json({ error: "حذف شرکت انجام نشد." }, 400);
    if (!data) return json({ error: "شرکت پیدا نشد." }, 404);
    return json({ ok: true, kind, id });
  }

  if (id === requester.id) {
    return json({ error: "برای جلوگیری از قفل‌شدن پنل، مدیر نمی‌تواند حساب خودش را حذف کند." }, 400);
  }

  const { data: targetAdmin } = await serviceClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", id)
    .maybeSingle();
  if (targetAdmin) return json({ error: "حساب مدیر سایت از این بخش قابل حذف نیست." }, 400);

  const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(id);
  if (deleteUserError) return json({ error: "حذف حساب کاربر انجام نشد." }, 400);

  return json({ ok: true, kind, id });
});
