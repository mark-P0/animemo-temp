import { useState, useEffect, TransitionEvent, ReactNode } from 'react';
import { LightBulbIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Character, getRandomExistingCharacter } from './jikan.js';

const Game = await (async () => {
  let state: boolean | null = null;
  let prevChar = await getRandomExistingCharacter();
  const seenCharIds = new Set<number>();

  return {
    async getNewCharacter(): Promise<Character> {
      const newChar = await getRandomExistingCharacter();
      if (newChar.mal_id === prevChar.mal_id) {
        return this.getNewCharacter();
      }
      return newChar;
    },
    get state() {
      return state;
    },

    reject(id: number) {
      if (!seenCharIds.has(id)) state = false;
    },
    accept(id: number) {
      if (seenCharIds.has(id)) {
        state = false;
        return;
      }
      seenCharIds.add(id);
    },
    reset() {
      state = null;
      seenCharIds.clear();
    },
  };
})();

function C(...classes: (string | boolean | undefined | null)[]): string {
  const strings = classes.filter((cls): cls is string => typeof cls === 'string');
  return strings.join(' ');
}

function Header({ onReset }: { onReset: () => void }) {
  const classes = C('bg-neutral-600 text-white', 'flex justify-between items-center gap-3 py-2');
  return (
    <header className={classes}>
      <code>animemo</code>
      <button className="h-5 aspect-square rounded-full text-white" type="button" onClick={onReset}>
        <ArrowPathIcon className="min-h-[1rem] h-full" />
      </button>
    </header>
  );
}

function BaseCard({
  slideOutTo = null,
  onSlideOutEnd,
  className = '',
  children,
}: {
  slideOutTo?: 'left' | 'right' | null;
  onSlideOutEnd?: () => void;
  className: string;
  children?: ReactNode; // According to cheatsheet (https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/basic_type_example/)
}) {
  const [willSlideIn, setWillSlideIn] = useState(false);
  useEffect(() => {
    /**
     * For some reason, the slide-in state is set immediately and
     * prevents the transition animation from working properly.
     * Adding this small "delay" allows things to work as expected.
     */
    const timeoutId = setTimeout(() => setWillSlideIn(true), 100);
    return () => {
      clearTimeout(timeoutId); // Shouldn't be necessary, but just in case...
    };
  }, []);

  function handleTransitionEnd(event: TransitionEvent) {
    if (slideOutTo === null) return;
    if (event.propertyName !== 'transform') return;

    if (onSlideOutEnd) onSlideOutEnd();
  }

  const classes = C(
    /* Animation */
    C(
      'transition ease-out duration-500',
      !willSlideIn && '-translate-y-[100vh] -rotate-12', // Slide this component in by removing these classes that are initially present
      slideOutTo !== null &&
        (slideOutTo === 'right'
          ? 'opacity-0 translate-x-full rotate-12'
          : 'opacity-0 -translate-x-full -rotate-12')
    ),
    /* Form */
    'my-6 mx-auto max-h-full max-w-full min-w-0 aspect-[9/18] sm:aspect-[3/4]',
    /* Appearance */
    'bg-neutral-200 rounded-lg',
    /* Content Layout */
    className
  );
  return (
    <div className={classes} onTransitionEnd={handleTransitionEnd}>
      {children}
    </div>
  );
}

function CharacterCardDetails({ char }: { char: Character }) {
  const { name, name_kanji, url } = char;
  const { image_url } = char.images.jpg;

  return (
    <div className="bg-white rounded-md overflow-hidden grid grid-rows-[1fr_min-content]">
      <a className="overflow-hidden" href={url} target="_blank" rel="noopener noreferrer">
        <img
          className="h-full w-full object-cover object-top overflow-hidden border-4 border-neutral-800"
          src={image_url}
          alt={name}
        />
      </a>
      <div className=" flex items-center justify-between gap-3 p-3">
        <p className="uppercase tracking-widest text-sm font-semibold">{name}</p>
        <p className="text-xs text-neutral-500 text-right">{name_kanji}</p>
      </div>
    </div>
  );
}

function CharacterCard({ char, onChoice }: { char: Character; onChoice: () => void }) {
  const [hasUserAccepted, setHasUserAccepted] = useState<boolean | null>(null);
  const handler = {
    reject() {
      Game.reject(char.mal_id);
      setHasUserAccepted(false);
    },
    accept() {
      Game.accept(char.mal_id);
      setHasUserAccepted(true);
    },
  };

  const buttons = (
    <div className="flex justify-evenly py-3">
      <button
        className="aspect-square bg-neutral-300 rounded-full p-4"
        type="button"
        onClick={handler.reject}
      >
        <EyeIcon className="min-h-[1rem]" />
      </button>
      <button
        className="aspect-square bg-neutral-800 text-white rounded-full p-4"
        type="button"
        onClick={handler.accept}
      >
        <LightBulbIcon className="min-h-[1rem]" />
      </button>
    </div>
  );

  const classes = C('grid gap-3 p-5 pb-3', 'grid-rows-[6fr_1fr] sm:grid-rows-[4fr_1fr]');
  const slideDir = hasUserAccepted === null ? null : hasUserAccepted ? 'right' : 'left';
  return (
    <BaseCard className={classes} slideOutTo={slideDir} onSlideOutEnd={onChoice}>
      <CharacterCardDetails char={char} />
      {buttons}
    </BaseCard>
  );
}

function EndCard({ text }: { text: string }) {
  const classes = 'grid place-items-center';
  return <BaseCard className={classes}>{text}</BaseCard>;
}

let ct = 1;
let prefetchedChar = await getRandomExistingCharacter();
function Main() {
  const [char, setChar] = useState<Character>(prefetchedChar);
  useEffect(() => {
    (async () => {
      prefetchedChar = await getRandomExistingCharacter();
    })();
  }, [char]);

  function handleChoice() {
    ct++;
    setChar({ ...prefetchedChar });
  }

  const classes = C(
    'h-full w-full',
    'flex', // Set as flex container so that children's `h-full` can reflect this element's
    'overflow-hidden' // Without these, the card children exceed their intended size
  );
  return (
    <main className={classes}>
      {Game.state === true && <EndCard text="WIN!!!" />}
      {Game.state === false && <EndCard text="You lost..." />}
      {Game.state === null && <CharacterCard key={ct} char={char} onChoice={handleChoice} />}
    </main>
  );
}

export function App() {
  const [gameCt, setGameCt] = useState(0);

  function resetApp() {
    Game.reset();
    setGameCt(gameCt + 1);
  }

  const classes = C(
    C('h-screen overflow-hidden bg-neutral-700'),
    C('grid grid-rows-[min-content_1fr]'),
    C('[&>*]:px-4 sm:[&>*]:px-[10%]') // Pad sides so that they are not too flushed
  );
  return (
    <div className={classes}>
      <Header onReset={resetApp} />
      <Main key={gameCt} />
    </div>
  );
}
