import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const { search, hash, pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const p = new URLSearchParams(search);
      const next = p.get('next') || '/start';
      const intent = p.get('intent') || '';
      const code = p.get('code');
      const err  = p.get('error_description');

      if (err) {
        return navigate(`/signin?next=${encodeURIComponent(next)}&intent=${intent}`, { replace: true });
      }

      // 1) Magic link: #access_token in the hash
      if (hash.includes('access_token')) {
        const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
        // clean the hash
        window.history.replaceState({}, '', pathname + search);
        if (error) {
          return navigate(`/signin?next=${encodeURIComponent(next)}&intent=${intent}`, { replace: true });
        }
      }
      // 2) OAuth / code flow: ?code= in the query
      else if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (error) {
          return navigate(`/signin?next=${encodeURIComponent(next)}&intent=${intent}`, { replace: true });
        }
      }

      // final redirect
      const target =
        next ||
        (intent === 'team'
          ? '/team-profile/create'
          : intent === 'client'
          ? '/projects?open=post-project'
          : '/start');

      navigate(target, { replace: true });
    })();
  }, [search, hash, pathname, navigate]);

  return null;
}