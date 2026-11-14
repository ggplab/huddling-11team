import { CONFIG } from '../config';
import type { Banner, BannerKind } from '../data/types';
import { color, teamColor } from '../theme';

const KINDS: Record<BannerKind, { code: string; label: string; bg: string; fg: string; stat: string }> = {
  pr: { code: 'BOOST', label: 'PR 머지', bg: color.boost, fg: '#FFFFFF', stat: '+30' },
  fire: { code: 'SLIP', label: 'CI 실패', bg: color.slip, fg: '#FFFFFF', stat: '-5' },
  rank: { code: 'LEAD', label: '선두 교체', bg: color.lead, fg: '#1B1B1A', stat: '1위' },
  finish: { code: 'FINISH', label: '결승 통과', bg: '#FFFFFF', fg: '#1B1B1A', stat: 'FINISH' },
};

/**
 * 중계 팝오버(로워서드). 4종: pr / fire / rank / finish
 * live 모드에서는 CONFIG.bannerMs 동안 하단 게이지가 차오른 뒤 사라진다.
 */
export function BroadcastBanner({ banner, live, accent = color.accent }: { banner: Banner; live: boolean; accent?: string }) {
  const k = KINDS[banner.kind];
  const badgeBg = banner.kind === 'pr' ? accent : k.bg;
  const isFinish = banner.kind === 'finish';
  const statText = isFinish ? 'FINISH' : banner.kind === 'rank' ? `${banner.prev}팀 → ${banner.team}팀` : k.stat;

  return (
    <div
      className="cr-lt"
      role="status"
      aria-live="polite"
      style={{ position: 'absolute', left: 300, bottom: 40, width: 920, zIndex: 50, display: 'flex', flexDirection: 'column', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.35))' }}
    >
      <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 12px', background: color.live, color: '#FFFFFF', fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', borderRadius: '6px 6px 0 0' }}>
        <div className="cr-blink" style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFFFFF' }} />
        LIVE 중계, {banner.time}
      </div>
      <div style={{ display: 'flex', height: 96, borderRadius: '0 10px 10px 10px', overflow: 'hidden' }}>
        <div
          style={{
            width: 150,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            color: k.fg,
            background: isFinish ? 'repeating-conic-gradient(#1B1B1A 0% 25%, #FFFFFF 0% 50%) 0 0 / 24px 24px' : badgeBg,
            textShadow: isFinish ? '0 0 6px #FFFFFF, 0 0 2px #FFFFFF' : undefined,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.14em' }}>{k.code}</div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{isFinish ? `${banner.order ?? 1}번째 완주` : k.label}</div>
        </div>
        <div style={{ position: 'relative', flexGrow: 1, minWidth: 0, background: color.ink, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 16, padding: '0 22px' }}>
          <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, color: '#FFFFFF', border: '3px solid #FFFFFF', background: teamColor(banner.team - 1, CONFIG.myTeam - 1, accent) }}>
            {banner.team}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>{banner.title}</div>
            <div style={{ fontSize: 14, color: '#D6D6D2', lineHeight: 1.4 }}>{banner.line}</div>
          </div>
          <div style={{ flexGrow: 1 }} />
          <div style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 8, fontSize: banner.kind === 'rank' ? 16 : 24, fontWeight: 900, fontVariantNumeric: 'tabular-nums', background: isFinish ? '#FFFFFF' : badgeBg, color: isFinish ? '#1B1B1A' : k.fg }}>
            {statText}
          </div>
          {live && <div className="cr-ltbar" style={{ position: 'absolute', left: 0, bottom: 0, height: 4, width: '100%', opacity: 0.9, background: isFinish ? color.lead : badgeBg, animationDuration: `${CONFIG.bannerMs}ms` }} />}
        </div>
      </div>
    </div>
  );
}
