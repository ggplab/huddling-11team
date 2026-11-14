import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG, SPEED_EVERY, type Speed } from '../config';
import { blendReal, loadSnapshot } from './realData';
import { createScenarioState, simulateEvent } from './simulation';
import type { RaceState, Scenario } from './types';

interface Options {
  scenario: Scenario;
  speed: Speed;
  selected: number | null;
}

export const MULTS = [1, 2, 5, 10] as const;

/**
 * 레이스 상태 훅.
 * - scenario === 'live': 틱마다 시계가 1초 가고, speed 간격마다 이벤트가 하나 생긴다.
 *   배속(mult)은 틱 간격을 줄인다. 지나간 상태는 history 에 쌓여 재생바로 앞뒤 이동이 된다.
 * - 그 외: 해당 팝오버 케이스로 고정된 화면 (시간 정지, 배너 유지).
 */
export function useRace({ scenario, speed, selected }: Options) {
  const [state, setState] = useState<RaceState>(() => createScenarioState(scenario));
  const [running, setRunning] = useState(true);
  const [mult, setMult] = useState<number>(1);
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const history = useRef<RaceState[]>([state]);
  const cursor = useRef(0);

  const isLive = scenario === 'live';
  const every = SPEED_EVERY[speed];

  const step = useCallback(
    (prev: RaceState): RaceState => {
      const tick = prev.tick + 1;
      const base = { ...prev, tick, elapsed: prev.elapsed + 1, banner: null };
      if (tick % every !== 0) return base;
      return simulateEvent(base, { goal: CONFIG.goal, myTeam: CONFIG.myTeam, selected: selectedRef.current });
    },
    [every],
  );

  const reset = useCallback((s: RaceState) => {
    history.current = [s];
    cursor.current = 0;
    setState(s);
  }, []);

  useEffect(() => {
    reset(createScenarioState(scenario));
  }, [scenario, reset]);

  // 실제 수집본을 한 번 불러와 출발 상태에 섞는다(live 일 때만)
  useEffect(() => {
    if (scenario !== 'live') return;
    let alive = true;
    void loadSnapshot().then((snap) => {
      if (alive && snap) reset(blendReal(createScenarioState('live'), snap));
    });
    return () => {
      alive = false;
    };
  }, [scenario, reset]);

  /** 재생바: 경과 시간(초)으로 이동한다. 아직 안 간 곳이면 그만큼 미리 계산한다. */
  const seek = useCallback(
    (elapsed: number) => {
      const h = history.current;
      const target = Math.max(0, Math.min(CONFIG.durationSec - h[0].elapsed, Math.round(elapsed - h[0].elapsed)));
      while (h.length <= target) h.push(step(h[h.length - 1]));
      cursor.current = target;
      setState({ ...h[target], banner: null });
    },
    [step],
  );

  useEffect(() => {
    if (!isLive || !running) return;
    const id = window.setInterval(() => {
      const h = history.current;
      if (h[cursor.current].elapsed >= CONFIG.durationSec) return;
      const next = cursor.current + 1;
      if (h.length <= next) h.push(step(h[h.length - 1]));
      cursor.current = next;
      setState(h[next]);
    }, 1000 / mult);
    return () => window.clearInterval(id);
  }, [isLive, running, mult, step]);

  // 중계 자막: 배속과 상관없이 실제 시간으로 CONFIG.bannerMs 동안 보인다.
  // 보이는 동안 새로 생긴 배너는 건너뛴다(배속을 올려도 자막을 읽을 수 있게).
  const [shown, setShown] = useState<RaceState['banner']>(null);
  const lastShown = useRef<RaceState['banner']>(null);
  useEffect(() => {
    if (isLive && state.banner && !shown && state.banner !== lastShown.current) {
      lastShown.current = state.banner;
      setShown(state.banner);
    }
  }, [isLive, state.banner, shown]);
  useEffect(() => {
    if (!shown) return;
    const id = window.setTimeout(() => setShown(null), CONFIG.bannerMs);
    return () => window.clearTimeout(id);
  }, [shown]);
  const banner = isLive ? shown : state.banner;

  const toggleRunning = useCallback(() => setRunning((r) => !r), []);
  const start = history.current[0].elapsed;

  return { state, banner, running: isLive ? running : true, toggleRunning, isLive, mult, setMult, seek, start };
}
