import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/supabase/session.server';
import AvatarUpload from '@/components/AvatarUpload';
import ProfileForm from '@/components/ProfileForm';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect('/login?next=/perfil');

  const supabase = createClient();
  const { data } = supabase
    ? await supabase
        .from('profiles')
        .select('role, full_name, company_name, phone, address, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null };

  const isOwner = data?.role === 'owner';
  const initial = (data?.full_name || user.email || '?').charAt(0).toUpperCase();

  return (
    <section className="mx-auto max-w-xl px-6 py-16">
      <p className="text-xs font-bold uppercase tracking-wide text-vivi-mint">Tu cuenta</p>
      <h1 className="mt-2 text-2xl font-extrabold text-vivi-ink sm:text-3xl">Editar perfil</h1>
      <p className="mt-2 text-sm text-vivi-muted">{user.email}</p>

      <div className="mt-6">
        <AvatarUpload currentUrl={data?.avatar_url ?? null} initial={initial} />
      </div>

      <ProfileForm
        initialFullName={data?.full_name ?? ''}
        initialCompanyName={data?.company_name ?? ''}
        initialPhone={data?.phone ?? ''}
        initialAddress={data?.address ?? ''}
        isOwner={isOwner}
      />
    </section>
  );
}
