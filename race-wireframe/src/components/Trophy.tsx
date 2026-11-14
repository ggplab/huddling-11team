import { MEDAL, MEDAL_DARK } from '../theme';

/** 1~3위 트로피 아이콘. rank는 1|2|3 */
export function Trophy({ rank, size = 30 }: { rank: 1 | 2 | 3; size?: number }) {
  const cup = MEDAL[rank - 1];
  const dark = MEDAL_DARK[rank - 1];
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" role="img" aria-label={`${rank}위`} style={{ flexShrink: 0 }}>
      <path d="M8.2 6.5 H4.8 A3.4 3.4 0 0 0 8.6 12.6" fill="none" stroke={cup} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M19.8 6.5 H23.2 A3.4 3.4 0 0 1 19.4 12.6" fill="none" stroke={cup} strokeWidth={2.2} strokeLinecap="round" />
      <path d="M7.5 3.5 H20.5 V10.5 A6.5 6.5 0 0 1 7.5 10.5 Z" fill={cup} stroke={dark} strokeWidth={1.2} />
      <rect x={12.4} y={16.8} width={3.2} height={3.6} fill={dark} />
      <rect x={8.5} y={20.4} width={11} height={4.6} rx={1.2} fill={dark} />
      <text x={14} y={12.6} fontSize={8.5} fontWeight={900} textAnchor="middle" fill="#1B1B1A">
        {rank}
      </text>
    </svg>
  );
}
