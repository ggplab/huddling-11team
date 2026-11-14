import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG, SPEED_EVERY, type Speed } from '../config';
import { createScenarioState, simulateEvent } from './simulation';
import type { RaceState, Scenario } from './types';

interface Options {
  scenario: Scenario;
  speed: Speed;
  selected: number | null;
}

/**
 * 레이스 상태 훅.
 * - scenario === 'live': 1초마다 시계가 가고, speed 간격마다 이벤트가 하나 생긴다.
 * - 그 외: 해당 팝오버 케이스로 고정된 화면 (시간 정지, 배너 유지).
 *
 * 실제 데이터로 바꿀 때는 이 훅 안의 simulateEvent 호출 부분을
 * data/github.ts 의 폴링 결과로 교체하면 된다. 화면 컴포넌트는 RaceState만 본다.
 */
export function useRace({ scenario, speed, selected }: Options) {
  const [state, setState] = useState<RaceState>(() => createScenarioState(scenario));
  const [running, setRunning] = useState(true);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const isLive = scenario === 'live';

  useEffect(() => {
    setState(createScenarioState(scenario));
  }, [scenario]);

  useEffect(() => {
    if (!isLive || !running) return;
    const every = SPEED_EVERY[speed];
    const id = window.setInterval(() => {
      setState((prev) => {
        const tick = prev.tick + 1;
        const base = { ...prev, tick, elapsed: prev.elapsed + 1 };
        if (tick % every !== 0) return base;
        return simulateEvent(base, { goal: CONFIG.goal, myTeam: CONFIG.myTeam, selected: selectedRef.current });
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isLive, running, speed]);

  // 배너는 CONFIG.bannerMs 뒤 자동으로 사라진다 (케이스 화면에서는 유지)
  const banner = state.banner;
  useEffect(() => {
    if (!isLive || !banner) return;
    const id = window.setTimeout(() => {
      setState((prev) => (prev.banner === banner ? { ...prev, banner: null } : prev));
    }, CONFIG.bannerMs);
    return () => window.clearTimeout(id);
  }, [isLive, banner]);

  const toggleRunning = useCallback(() => setRunning((r) => !r), []);

  return { state, running: isLive ? running : true, toggleRunning, isLive };
}
