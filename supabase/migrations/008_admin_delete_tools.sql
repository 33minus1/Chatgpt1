-- Karzan admin destructive actions
-- Centralized, admin-only deletion for jobs, companies and user accounts.

create or replace function public.admin_delete_entity(p_kind text, p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_count integer := 0;
  v_admin uuid := auth.uid();
begin
  if v_admin is null or not public.is_admin() then
    raise exception 'دسترسی مدیریت تأیید نشد.';
  end if;

  if p_kind = 'job' then
    delete from public.jobs where id = p_id;
    get diagnostics v_count = row_count;

  elsif p_kind = 'company' then
    delete from public.companies where id = p_id;
    get diagnostics v_count = row_count;

  elsif p_kind = 'user' then
    if p_id = v_admin then
      raise exception 'مدیر نمی‌تواند حساب خودش را حذف کند.';
    end if;

    if exists (select 1 from public.admin_users where user_id = p_id) then
      raise exception 'حساب مدیر سایت از این بخش قابل حذف نیست.';
    end if;

    delete from auth.users where id = p_id;
    get diagnostics v_count = row_count;

  else
    raise exception 'نوع حذف معتبر نیست.';
  end if;

  if v_count = 0 then
    raise exception 'رکورد موردنظر پیدا نشد.';
  end if;

  return jsonb_build_object('ok', true, 'kind', p_kind, 'id', p_id);
end;
$$;

revoke all on function public.admin_delete_entity(text, uuid) from public, anon;
grant execute on function public.admin_delete_entity(text, uuid) to authenticated;
