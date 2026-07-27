import { CreditCard, FileText, Globe2, IdCard, KeyRound, Wifi } from 'lucide-react';
import { FaAws } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SiGithub, SiMercadopago, SiStripe } from 'react-icons/si';
import type { VaultEntry } from '../../domain/entities/entry';
import { cn, entryInitials } from '../../lib/utils';

type EntryLogoSize = 'command' | 'list' | 'detail';

interface EntryLogoProps {
  entry: VaultEntry;
  size?: EntryLogoSize;
}

const renderGenericIcon = (entry: VaultEntry) => {
  if (entry.id === 'wifi') return <Wifi />;
  if (entry.id === 'registro-br') return <Globe2 />;
  if (entry.type === 'card') return <CreditCard />;
  if (entry.type === 'secure-note') return <FileText />;
  if (entry.type === 'identity') return <IdCard />;
  return <KeyRound />;
};

export function EntryLogo({ entry, size = 'list' }: EntryLogoProps) {
  const className = cn('entry-logo', `entry-logo--${size}`);

  if (entry.id === 'github') {
    return (
      <span className={cn(className, 'entry-logo--github')} aria-hidden="true">
        <SiGithub />
      </span>
    );
  }

  if (entry.id === 'google') {
    return (
      <span className={cn(className, 'entry-logo--google')} aria-hidden="true">
        <FcGoogle />
      </span>
    );
  }

  if (entry.id === 'aws') {
    return (
      <span className={cn(className, 'entry-logo--aws')} aria-hidden="true">
        <FaAws />
      </span>
    );
  }

  if (entry.id === 'inter') {
    return (
      <span className={cn(className, 'entry-logo--inter')} aria-hidden="true">
        <b>inter</b>
      </span>
    );
  }

  if (entry.id === 'mercado-livre') {
    return (
      <span className={cn(className, 'entry-logo--mercado-livre')} aria-hidden="true">
        <SiMercadopago />
      </span>
    );
  }

  if (entry.id === 'stripe') {
    return (
      <span className={cn(className, 'entry-logo--stripe')} aria-hidden="true">
        <SiStripe />
      </span>
    );
  }

  return (
    <span className={cn(className, 'entry-logo--generic')} aria-hidden="true">
      {renderGenericIcon(entry)}
      <span className="sr-only">{entryInitials(entry.title)}</span>
    </span>
  );
}
