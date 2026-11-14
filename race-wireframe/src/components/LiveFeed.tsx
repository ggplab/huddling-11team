import type { CSSProperties } from 'react';
import type { FeedItem, FeedKind } from '../data/types';
import { color } from '../theme';

const chip = (bg: string, fg: string): CSSProperties => ({
  fontSize: 11,
  fontWeight: 700,
  borderRadius: 4,
  padding: '2px 6px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  background: bg,
  color: fg,
});

export const FEED_CHIP: Record<FeedKind, CSSProperties> = {
  pr: chip('#E6EDFB', '#1D47AB'),
  commit: chip('#EDEDEA', '#3D3D3A'),
  fire: chip('#FDEDE4', '#A63A0B'),
  rank: chip('#E7F4EE', '#1E6B47'),
};

export function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <>
      {items.map((f, k) => (
        <div key={`${f.time}-${k}-${f.text}`} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '5px 0', borderBottom: `1px solid ${color.lineSoft}` }}>
          <div style={{ fontSize: 12, color: color.textMuted, width: 38, flexShrink: 0, paddingTop: 2 }}>{f.time}</div>
          <div style={FEED_CHIP[f.kind]}>{f.type}</div>
          <div style={{ fontSize: 13, lineHeight: 1.45 }}>{f.text}</div>
        </div>
      ))}
    </>
  );
}

export function LiveFeed({ items }: { items: FeedItem[] }) {
  return (
    <>
      <section style={{ background: '#FFFFFF', border: '1px dashed #B9B9B4', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>파트별 주행 기록 보기</div>
        <div style={{ fontSize: 13, color: color.textMuted, lineHeight: 1.5 }}>왼쪽 순위나 트랙 위 말을 누르면 기획, 디자인, 개발, 문서 파트가 각각 얼마나 달렸는지 여기에 열려요</div>
      </section>
      <section style={{ flexGrow: 1, minHeight: 0, background: '#FFFFFF', border: `1px solid ${color.line}`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>실시간 중계</h2>
        <FeedList items={items} />
      </section>
    </>
  );
}
