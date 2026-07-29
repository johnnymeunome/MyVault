import type { CSSProperties, ReactNode } from 'react';
import { FaAws } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SiGithub, SiStripe } from 'react-icons/si';
import type { VaultEntry } from '../../domain/entities/entry';
import { cn, entryInitials } from '../../lib/utils';

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
  if (entry.id === 'stripe') {
    return { className: 'entry-logo--stripe', content: <SiStripe /> };
  }
  return null;
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
      className={cn(baseClassName, 'entry-logo--monogram')}
      style={{ '--entry-accent': entry.accent } as CSSProperties}
      aria-hidden="true"
    >
      {entryInitials(entry.title)}
    </span>
  );
}
