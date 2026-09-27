import { useEffect, useState } from 'react'
import { AdminGate } from './AdminGate'
import { listAdminCompanies, updateAdminCompanyStatus, type AdminCompanyItem } from '../lib/adminBackend'
const label: Record<string,string> = { pending:'در انتظار تأیید', verified:'تأیید شده', blocked:'مسدود' }
export function AdminCompaniesPage() {
  const [rows,setRows] = useState<AdminCompanyItem[]>([]); const [busy,setBusy] = useState('')
  const load=()=>listAdminCompanies().then(setRows); useEffect(()=>{load().catch(()=>{})},[])
  async function setStatus(id:string,status:'verified'|'blocked'){setBusy(id+status);try{await updateAdminCompanyStatus(id,status);await load()}finally{setBusy('')}}
  return <AdminGate><main className="admin-page"><div className="container admin-wrap"><header className="admin-head"><div><h1>شرکت‌ها</h1><p>فقط شرکت‌های واقعی و قابل تماس را تأیید کن.</p></div></header>
    <div className="admin-list">{rows.map(row=><article className="admin-card" key={row.id}><div className="admin-card-main"><div><span className={`admin-state ${row.status}`}>{label[row.status]}</span><h2>{row.name}</h2><p>{row.industry || 'بدون حوزه فعالیت'} · {row.city || 'شهر نامشخص'}</p><p className="admin-phone">{row.phone || 'شماره ثبت نشده'}</p></div><small>{row.createdAt}</small></div>
      {row.status==='pending'&&<div className="admin-actions"><button className="btn btn-success" disabled={!!busy} onClick={()=>setStatus(row.id,'verified')}>تأیید شرکت</button><button className="btn btn-danger-soft" disabled={!!busy} onClick={()=>setStatus(row.id,'blocked')}>مسدود کردن</button></div>}
    </article>)}</div></div></main></AdminGate>
}
