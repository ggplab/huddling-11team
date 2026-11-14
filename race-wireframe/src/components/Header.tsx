import type { CSSProperties, ReactNode } from 'react';
import { color } from '../theme';

export function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: ReactNode }) {
  return (
    <header
      style={{
        height: 72,
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        background: color.surface,
        borderBottom: `1px solid ${color.line}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: 12, color: color.textMuted }}>{subtitle}</div>
      </div>
      <div style={{ flexGrow: 1 }} />
      {children}
    </header>
  );
}

export const btnOutline: CSSProperties = {
  height: 44,
  padding: '0 16px',
  border: `1px solid ${color.line}`,
  borderRadius: 8,
  background: color.surface,
  fontSize: 13,
  fontWeight: 500,
  color: color.text,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};

export const btnSolid: CSSProperties = {
  height: 44,
  padding: '0 18px',
  border: 'none',
  borderRadius: 8,
  background: color.ink,
  color: '#FFFFFF',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
};
