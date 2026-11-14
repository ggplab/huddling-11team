import { useState } from 'react';
import type { Speed } from './config';
import { Stage } from './components/Stage';
import type { Scenario } from './data/types';
import { PodiumScreen } from './screens/PodiumScreen';
import { IntroScreen } from './screens/IntroScreen';
import { MobileRaceScreen, useIsMobile } from './screens/MobileRaceScreen';
import { RaceScreen } from './screens/RaceScreen';
import { StartScene } from './screens/StartScene';

type Screen = 'intro' | 'start' | 'race' | 'podium';

/**
 * 화면 흐름: intro(설명, 버튼으로 진행) → start(출발) → race(레이스 중계) → podium(시상식)
 *
 * URL 파라미터 (QA, 발표용)
 *   ?screen=race            레이스 화면부터 시작
 *   ?scenario=pr|fire|rank|finish   팝오버 케이스 고정 화면 (screen=race 자동)
 *   ?speed=slow|normal|fast  시뮬레이션 속도
 */
function readParams() {
  const q = new URLSearchParams(window.location.search);
  const scenario = (q.get('scenario') as Scenario | null) ?? 'live';
  const screen = (q.get('screen') as Screen | null) ?? (scenario !== 'live' ? 'race' : 'intro');
  const speed = (q.get('speed') as Speed | null) ?? 'normal';
  return { scenario, screen, speed };
}

export default function App() {
  const params = readParams();
  const [screen, setScreen] = useState<Screen>(params.screen);
  const mobile = useIsMobile();
  // 같은 화면을 다시 열 때 처음부터 재생되도록 key를 바꾼다
  const [runId, setRunId] = useState(0);
  const goto = (s: Screen) => {
    setRunId((n) => n + 1);
    setScreen(s);
  };

  // 설명 화면: 버튼을 눌러야 출발로 넘어간다
  if (screen === 'intro') {
    return <IntroScreen onStart={() => goto('start')} onSkip={() => goto('race')} />;
  }

  // 휴대폰 폭의 레이스 화면은 고정 1600×900 무대를 쓰지 않고 세로로 쌓는다
  if (mobile && screen === 'race' && params.scenario === 'live') {
    return <MobileRaceScreen key={runId} speed={params.speed} onFinish={() => goto('podium')} />;
  }

  return (
    <Stage>
      {screen === 'start' && <StartScene key={runId} onDone={() => goto('race')} />}
      {screen === 'race' && <RaceScreen key={runId} scenario={params.scenario} speed={params.speed} onFinish={() => goto('podium')} />}
      {screen === 'podium' && <PodiumScreen key={runId} onReplay={() => goto('start')} onBackToRace={() => goto('race')} />}
    </Stage>
  );
}
