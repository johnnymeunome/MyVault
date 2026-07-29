import { CreditCard, FileText, Globe2, IdCard, KeyRound, Wifi } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { FaAws } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SiGithub, SiMercadopago, SiStripe } from 'react-icons/si';
import type { VaultEntry } from '../../domain/entities/entry';
import { cn } from '../../lib/utils';

type EntryLogoSize = 'command' | 'list' | 'detail';

interface EntryLogoProps {
  entry: VaultEntry;
  size?: EntryLogoSize;
}

interface KnownMark {
  className: string;
  content: ReactNode;
}

const knownMarkFor = (entry: VaultEntry): KnownMark | null => {
  if (entry.id === 'github') {
    return { className: 'entry-logo--github', content: <SiGithub /> };
  }
  if (entry.id === 'google') {
    return { className: 'entry-logo--google', content: <FcGoogle /> };
  }
  if (entry.id === 'aws') {
    return { className: 'entry-logo--aws', content: <FaAws /> };
  }
  if (entry.id === 'inter') {
    return { className: 'entry-logo--inter', content: <b>inter</b> };
  }
  if (entry.id === 'mercado-livre') {
    return { className: 'entry-logo--mercado-livre', content: <SiMercadopago /> };
  }
  if (entry.id === 'stripe') {
    return { className: 'entry-logo--stripe', content: <SiStripe /> };
  }
  return null;
};

const genericIconFor = (entry: VaultEntry) => {
  if (entry.id === 'wifi') return <Wifi />;
  if (entry.id === 'registro-br') return <Globe2 />;
  if (entry.type === 'card') return <CreditCard />;
  if (entry.type === 'secure-note') return <FileText />;
  if (entry.type === 'identity') return <IdCard />;
  return <KeyRound />;
};

export function EntryLogo({ entry, size = 'list' }: EntryLogoProps) {
  const baseClassName = cn('entry-logo', `entry-logo--${size}`);
  const knownMark = knownMarkFor(entry);

  if (knownMark) {
    return (
      <span className={cn(baseClassName, knownMark.className)} aria-hidden="true">
        {knownMark.content}
      </span>
    );
  }

  return (
    <span
      className={cn(baseClassName, 'entry-logo--generic')}
      style={{ '--entry-accent': entry.accent } as CSSProperties}
      aria-hidden="true"
    >
      {genericIconFor(entry)}
    </span>
  );
}
